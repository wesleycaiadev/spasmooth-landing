/**
 * Contratos de resposta — Single Source of Truth.
 *
 * Todos os services/, useCases/ e API routes devem importar
 * estes tipos em vez de redefinir os próprios.
 */

/** Resposta genérica para Server Actions e use cases. */
export type ServiceResponse<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
};

/** Resposta de ação sem payload de retorno (create/update/delete). */
export type ActionResult =
    | { success: true }
    | { success: false; error: string };

/** Resposta de ação com payload de retorno. */
export type DataResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };
