import roninImg from '../assets/chars/ronin.png';

export const CARD_IMAGE_OVERRIDES = {
    'Ronin': roninImg,
    // İleride buraya yeni kartlar eklenebilir. Örnek:
    // 'New Card': newCardImg,
};

/**
 * Objeyi derinlemesine (recursive) tarar ve içinde name özelliği CARD_IMAGE_OVERRIDES
 * listesinde olan bir kart nesnesi bulursa, resim URL'lerini yerel dosya ile değiştirir.
 */
export const applyImageOverrides = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    // Eğer dizi ise tüm elemanlarını tara
    if (Array.isArray(obj)) {
        obj.forEach(applyImageOverrides);
        return obj;
    }

    // Eğer obje ise ve bir kart nesnesi ise (name özelliği eşleşiyorsa)
    if (obj.name && CARD_IMAGE_OVERRIDES[obj.name]) {
        const overrideUrl = CARD_IMAGE_OVERRIDES[obj.name];
        
        if (obj.imageUri) obj.imageUri = overrideUrl;
        if (obj.imageUriEvolved) obj.imageUriEvolved = overrideUrl;
        if (obj.imageUriHero) obj.imageUriHero = overrideUrl;
        if (obj.iconUrl) obj.iconUrl = overrideUrl;
        if (obj.badgeIconUrl) obj.badgeIconUrl = overrideUrl;
        
        if (obj.iconUrls) {
            if (obj.iconUrls.medium) obj.iconUrls.medium = overrideUrl;
            if (obj.iconUrls.large) obj.iconUrls.large = overrideUrl;
        }
    }

    // Objelerin içindeki diğer nesneleri de taramaya devam et (örneğin deckData.deck içindeki kartlar)
    Object.values(obj).forEach(val => {
        if (val && typeof val === 'object') {
            applyImageOverrides(val);
        }
    });

    return obj;
};
