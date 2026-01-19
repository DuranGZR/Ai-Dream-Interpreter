export interface MoonPhaseData {
    phase: string;
    icon: 'moon' | 'circle' | 'cloud' | 'sun'; // Simplified Feather icon mapping
    description: string;
    illumination: number; // 0.0 to 1.0
}

export const getMoonPhase = (date: Date = new Date()): MoonPhaseData => {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    const day = date.getDate();

    let c = 0;
    let e = 0;
    let jd = 0;
    let b = 0;

    if (month < 3) {
        year--;
        month += 12;
    }

    ++month;

    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09; // jd is total days elapsed since reference

    b = jd / 29.5305882; // divide by the moon cycle
    b -= Math.floor(b); // get the fractional part
    b = Math.round(b * 8); // scale fraction from 0-8 (8 phases)

    if (b >= 8) {
        b = 0; // 0 and 8 are the same (New Moon)
    }

    // 0 => New Moon
    // 1 => Waxing Crescent
    // 2 => First Quarter
    // 3 => Waxing Gibbous
    // 4 => Full Moon
    // 5 => Waning Gibbous
    // 6 => Last Quarter
    // 7 => Waning Crescent

    switch (b) {
        case 0:
            return { phase: 'Yeni Ay', icon: 'circle', description: 'Başlangıçlar ve niyetler için uygun zaman.', illumination: 0 };
        case 1:
            return { phase: 'Hilal', icon: 'moon', description: 'Büyüme ve harekete geçme enerjisi.', illumination: 0.25 };
        case 2:
            return { phase: 'İlk Dördün', icon: 'moon', description: 'Kararlar netleşiyor, engelleri aşma zamanı.', illumination: 0.5 };
        case 3:
            return { phase: 'Şişkin Ay', icon: 'moon', description: 'Olgunlaşma ve detayları tamamlama.', illumination: 0.75 };
        case 4:
            return { phase: 'Dolunay', icon: 'sun', description: 'Tamamlanma, aydınlanma ve yüzleşme.', illumination: 1 };
        case 5:
            return { phase: 'Şişkin Ay (Küçülen)', icon: 'moon', description: 'Minnet duyma ve paylaşma.', illumination: 0.75 };
        case 6:
            return { phase: 'Son Dördün', icon: 'moon', description: 'Bırakma ve arınma zamanı.', illumination: 0.5 };
        case 7:
            return { phase: 'Hilal (Küçülen)', icon: 'moon', description: 'Dinlenme ve içe dönüş.', illumination: 0.25 };
        default:
            return { phase: 'Yeni Ay', icon: 'circle', description: '.', illumination: 0 };
    }
};
