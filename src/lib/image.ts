/**
 * Utilitários de processamento de imagens client-side.
 * 
 * - compressImage: redimensiona + comprime para JPEG antes do upload
 * - extractFileNameFromUrl: extrai nome do arquivo de URL pública do Supabase Storage
 */

/**
 * Comprime e redimensiona uma imagem client-side usando Canvas.
 * 
 * @param file - Arquivo de imagem original
 * @param maxDimension - Dimensão máxima (largura ou altura), default 1080px
 * @param quality - Qualidade JPEG (0-1), default 0.8
 * @returns File comprimido em JPEG
 */
export function compressImage(
    file: File,
    maxDimension = 1080,
    quality = 0.8
): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxDimension) {
                        height *= maxDimension / width;
                        width = maxDimension;
                    }
                } else {
                    if (height > maxDimension) {
                        width *= maxDimension / height;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Falha ao criar contexto Canvas.'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Falha ao comprimir imagem.'));
                            return;
                        }
                        resolve(
                            new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            })
                        );
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => reject(new Error('Falha ao carregar imagem.'));
        };

        reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
    });
}

/**
 * Extrai o nome do arquivo de uma URL pública do Supabase Storage.
 * 
 * URL típica: https://xxx.supabase.co/storage/v1/object/public/professional-photos/abc-123.jpg
 * Retorno: "abc-123.jpg"
 * 
 * Para URLs locais (/images/...), retorna null (não gerenciadas pelo Storage).
 */
export function extractFileNameFromUrl(url: string): string | null {
    if (!url) return null;

    // URLs do Supabase Storage
    if (url.includes('supabase.co') && url.includes('/professional-photos/')) {
        const parts = url.split('/professional-photos/');
        const fileName = parts[parts.length - 1];
        // Limpar query params se existirem
        return fileName?.split('?')[0] || null;
    }

    return null;
}
