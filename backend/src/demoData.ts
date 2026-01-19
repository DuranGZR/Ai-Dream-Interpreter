// Demo yanıtlar - OpenAI kotası dolduğunda kullanılır

export const demoInterpretations = [
  {
    dreamText: 'deniz',
    interpretation: `Bu rüyanız duygusal dünyaya, bilinçaltına ve yaşamın akışına işaret ediyor. Deniz genellikle duygusal derinliği, bilinmeyen korkuları ya da özgürlük arayışını simgeler.

**Deniz Sembolü:** Sakin bir deniz görüyorsanız, iç huzurunuzu ve duygusal dengenizi yansıtır. Dalgalı bir deniz ise yaşadığınız duygusal çalkantılara işaret edebilir.

**Psikolojik Yorum:** Carl Jung'a göre su, bilinçaltının sembolüdür. Deniz rüyaları genellikle iç dünyanıza yolculuk yapma, kendinizi keşfetme arzunuzu gösterir.

**Tavsiye:** Duygularınıza kulak verin ve onları bastırmak yerine ifade etmeyi deneyin.`,
    energy: 75,
    symbols: [
      { name: 'Deniz', meaning: 'Duygusal dünya, bilinçaltı, özgürlük' },
    ],
  },
  {
    dreamText: 'uçmak',
    interpretation: `Uçma rüyaları genellikle özgürlük, başarı ve sınırları aşma arzusunu simgeler. Bu, kendinizi güçlü ve özgür hissettiğiniz bir dönemde olduğunuzu gösterebilir.

**Uçuş Deneyimi:** Kolay ve keyifli uçuyorsanız, hayatta kontrolün sizde olduğunu ve hedeflerinize ulaşabileceğinizi hissediyorsunuz. Zor uçuyorsanız, bazı engellerle karşılaştığınızı gösterebilir.

**Psikolojik Yorum:** Freud'a göre uçma rüyaları cinsel enerjiye, Jung'a göre ise kişisel gelişime ve potansiyele işaret eder.

**Tavsiye:** Hedeflerinize odaklanın ve korkularınızı aşmak için cesaret gösterin.`,
    energy: 92,
    symbols: [
      { name: 'Uçmak', meaning: 'Özgürlük, başarı, sınırları aşma' },
    ],
  },
  {
    dreamText: 'yılan',
    interpretation: `Yılan rüyaları dönüşüm, iyileşme veya tehdit unsurlarını simgeler. Çok katmanlı bir semboldür ve kültüre göre anlamı değişir.

**Yılan Sembolü:** Yılan deri değiştirir, bu nedenle dönüşüm ve yeniden doğuş sembolüdür. Aynı zamanda gizli düşmanlar, tehlikeler ya da bastırılmış korkular anlamına da gelebilir.

**Psikolojik Yorum:** Jung'a göre yılan, kolektif bilinçaltının bir arketipidir ve bilgeliği simgeler. Freud ise yılanı cinsel enerji ile ilişkilendirir.

**Tavsiye:** Hayatınızda hangi değişimlerin zamanının geldiğini düşünün ve bu değişimlere açık olun.`,
    energy: 58,
    symbols: [
      { name: 'Yılan', meaning: 'Dönüşüm, iyileşme, tehdit' },
    ],
  },
];

export function getDemoInterpretation(dreamText: string) {
  const lowerText = dreamText.toLowerCase();
  
  // En alakalı demo yanıtı bul
  for (const demo of demoInterpretations) {
    if (lowerText.includes(demo.dreamText)) {
      return demo;
    }
  }
  
  // Varsayılan genel yanıt
  return {
    interpretation: `🎭 **Demo Mod Aktif**

Bu rüyanız ilginç semboller içeriyor. Gerçek AI yorumlama için OpenAI API kredisi gereklidir.

**Genel Yorum:** Rüyalarınız bilinçaltınızın mesajlarıdır. Her sembol, duygu ve olay sizin iç dünyanızdan bir yansımadır.

**Rüya Öğeleri:** Rüyanızda geçen kişiler, yerler ve nesneler genellikle sizin yaşam deneyimleriniz ve duygularınızla bağlantılıdır.

**Not:** Gerçek AI yorumu için OpenAI hesabınıza kredi eklemeniz gerekmektedir. Şu anda demo modda çalışıyorsunuz.`,
    energy: 65,
    symbols: [
      { name: 'Demo Sembol', meaning: 'Bu bir demo yorumdur' },
    ],
  };
}
