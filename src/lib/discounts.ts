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
}): DiscountCalculation {
    const originalPrice = Number(service.price) || 0;
    const discountPercent = Number(service.discount_percent) || 0;
    const isActive = Boolean(service.discount_active) && discountPercent > 0;

    if (!isActive) {
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

    const savingsAmount = (originalPrice * discountPercent) / 100;
    const finalPrice = Math.max(0, originalPrice - savingsAmount);

    return {
        hasDiscount: true,
        originalPrice,
        discountPercent,
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
