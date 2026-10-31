export interface DiscountCalculation {
    hasDiscount: boolean;
    originalPrice: number;
    discountPercent: number;
    finalPrice: number;
    formattedOriginalPrice: string;
    formattedFinalPrice: string;
    savingsAmount: number;
    formattedSavings: string;
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value || 0);
}

export function calculateDiscount(service: {
    price: number;
    discount_percent?: number | null;
    discount_active?: boolean | null;
    reference_price?: number | null;
}): DiscountCalculation {
    const currentPrice = Number(service.price) || 0;
    const originalPrice = Math.max(currentPrice, Number(service.reference_price) || 0);
    const discountPercent = Math.min(100, Math.max(0, Number(service.discount_percent) || 0));
    const isActive = Boolean(service.discount_active) && discountPercent > 0;

    if (!isActive && originalPrice === currentPrice) {
        return {
            hasDiscount: false,
            originalPrice,
            discountPercent: 0,
            finalPrice: originalPrice,
            formattedOriginalPrice: formatCurrency(originalPrice),
            formattedFinalPrice: formatCurrency(originalPrice),
            savingsAmount: 0,
            formattedSavings: formatCurrency(0),
        };
    }

    // Monthly packages store the exact selling price (800 / 300), avoiding a
    // rounded percentage turning 1200 -> 800 into an incorrect R$ 800,04.
    const finalPrice = Math.round(Math.max(0, currentPrice * (1 - (isActive ? discountPercent : 0) / 100)) * 100) / 100;
    const savingsAmount = originalPrice - finalPrice;

    return {
        hasDiscount: true,
        originalPrice,
        discountPercent: originalPrice > 0 ? (savingsAmount / originalPrice) * 100 : 0,
        finalPrice,
        formattedOriginalPrice: formatCurrency(originalPrice),
        formattedFinalPrice: formatCurrency(finalPrice),
        savingsAmount,
        formattedSavings: formatCurrency(savingsAmount),
    };
}

export function sanitizePhoneNumber(phone: string | null | undefined): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
}
