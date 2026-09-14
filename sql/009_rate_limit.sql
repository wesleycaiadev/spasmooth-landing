-- 009: Rate Limit Table + Function
-- ============================================================
-- A tabela rate_limit_entries e a função consume_rate_limit
-- nunca foram criadas em produção. Sem elas, TODAS as chamadas
-- de rateLimit() retornam false, bloqueando:
--   - getAvailableSlots (consulta de horários)
--   - createBooking (criação de agendamento)
--   - updateBookingInterest
--   - CSP report endpoint
-- ============================================================

-- 1. Criar tabela de rate limit
CREATE TABLE IF NOT EXISTS public.rate_limit_entries (
    key TEXT PRIMARY KEY,
    tokens INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    window_seconds INTEGER NOT NULL DEFAULT 60
);

-- Índice para limpeza periódica de entradas expiradas
CREATE INDEX IF NOT EXISTS idx_rate_limit_window
    ON public.rate_limit_entries (window_start);

-- 2. Criar (ou substituir) a função consume_rate_limit
-- Lógica: sliding window com tokens. Retorna TRUE se a requisição
-- foi permitida, FALSE se o limite foi atingido.
CREATE OR REPLACE FUNCTION public.consume_rate_limit(
    p_key TEXT,
    p_limit INTEGER,
    p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_now TIMESTAMPTZ := now();
    v_tokens INTEGER;
    v_window_start TIMESTAMPTZ;
BEGIN
    -- Validação básica
    IF p_limit <= 0 OR p_window_seconds <= 0 THEN
        RAISE EXCEPTION 'INVALID_RATE_LIMIT';
    END IF;

    -- Upsert: criar a entrada ou buscar existente
    INSERT INTO public.rate_limit_entries (key, tokens, window_start, window_seconds)
    VALUES (p_key, 1, v_now, p_window_seconds)
    ON CONFLICT (key) DO UPDATE
    SET
        -- Se a janela expirou, resetar
        tokens = CASE
            WHEN rate_limit_entries.window_start + (rate_limit_entries.window_seconds || ' seconds')::interval <= v_now
            THEN 1
            ELSE rate_limit_entries.tokens + 1
        END,
        window_start = CASE
            WHEN rate_limit_entries.window_start + (rate_limit_entries.window_seconds || ' seconds')::interval <= v_now
            THEN v_now
            ELSE rate_limit_entries.window_start
        END,
        window_seconds = p_window_seconds
    RETURNING tokens, window_start INTO v_tokens, v_window_start;

    -- Verificar se está dentro do limite
    RETURN v_tokens <= p_limit;
END;
$$;

-- 3. Permitir acesso via service_role (já incluso via SECURITY DEFINER)
-- mas garantir que anon não chame diretamente
REVOKE ALL ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;

-- 4. RLS na tabela (negar acesso direto a anon/authenticated)
ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;

-- 5. Limpeza periódica (opcional, pode ser chamada via cron do Supabase)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_entries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.rate_limit_entries
    WHERE window_start + (window_seconds || ' seconds')::interval < now() - interval '5 minutes';
END;
$$;
