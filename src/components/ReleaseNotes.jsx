import React from 'react';

const ReleaseNotes = () => {
  return (
    <div className="layout-container-lg mt-6 pb-20">
      <div className="glass-panel rounded-2xl p-6 md:p-10 border border-surface-container-high/50 relative overflow-hidden">
        
        {/* Background Accent */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-headline font-black uppercase text-white tracking-wider mb-2">
            Yama Notları
          </h1>
          <p className="text-on-surface-variant font-medium tracking-wide">
            Geleceği şekillendiren güncellemeler
          </p>
        </div>

        <div className="space-y-8">
          
          {/* Version 1.3.0 */}
          <div className="relative pl-6 md:pl-8 border-l-2 border-primary/30 pb-12">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]"></div>
            
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-4">
              <h2 className="text-3xl font-headline font-bold text-white tracking-wide">
                v1.3.0 <span className="text-primary">"Kusursuz Taktik"</span> Güncellemesi
              </h2>
              <span className="text-on-surface-variant text-sm bg-surface-container-high px-3 py-1 rounded-full w-max">
                11 Mayıs 2026
              </span>
            </div>

            <p className="text-on-surface text-lg mb-6 leading-relaxed">
              Deste oluşturma motorumuzu baştan aşağı yeniledik! Yapay zekanın yanına, profesyonel oyuncuların mantığını taklit eden <strong>Yepyeni bir Akıllı Algoritma</strong> ekledik. Artık desteler daha hızlı, daha mantıklı ve tamamen metaya uygun!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-surface-container/50 p-5 rounded-xl border border-surface-container-high">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-primary text-2xl">memory</span>
                  <h3 className="text-xl font-bold text-white">Akıllı Meta Eşleştirme</h3>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Deste oluştururken önce koleksiyonunu inceliyor ve saniyeler içinde dünyadaki en popüler ve başarılı destelerle kusursuz bir şekilde eşleştiriyoruz.
                </p>
              </div>

              <div className="bg-surface-container/50 p-5 rounded-xl border border-surface-container-high">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-tertiary text-2xl">link</span>
                  <h3 className="text-xl font-bold text-white">Koparılamaz Kombolar</h3>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Oyunun kilit kombolarını (Örn: Balon + Dondurma) otomatik tespit ediyor ve deste kurulurken bu ölümcül ikililerin bozulmamasını garanti ediyoruz.
                </p>
              </div>

              <div className="bg-surface-container/50 p-5 rounded-xl border border-surface-container-high">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">swap_calls</span>
                  <h3 className="text-xl font-bold text-white">Kusursuz Kart Değişimi</h3>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Eğer metadaki bir kart sende yoksa veya seviyesi düşükse, artık rastgele değil; aynı rolde, aynı iksir bedeline yakın en güçlü kartınla değiştiriliyor.
                </p>
              </div>

              <div className="bg-surface-container/50 p-5 rounded-xl border border-surface-container-high">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-error text-2xl">rocket_launch</span>
                  <h3 className="text-xl font-bold text-white">Işık Hızında Sonuçlar</h3>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Yeni algoritmamız sayesinde deste oluşturma hızı katlanarak arttı! Eski sisteme kıyasla bekleme süresi ve mantıksız deste üretme ihtimali neredeyse sıfıra indirildi.
                </p>
              </div>

            </div>
          </div>

          {/* Version 1.2.3 */}
          <div className="relative pl-6 md:pl-8 border-l-2 border-surface-container-highest pb-8 opacity-75">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface-container-highest"></div>
            
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-4">
              <h2 className="text-3xl font-headline font-bold text-white tracking-wide">
                v1.2.3 <span className="text-primary">"Meta İstihbaratı"</span> Güncellemesi
              </h2>
              <span className="text-on-surface-variant text-sm bg-surface-container-high px-3 py-1 rounded-full w-max">
                7 Mayıs 2026
              </span>
            </div>

            <p className="text-on-surface text-lg mb-6 leading-relaxed">
              Bu güncelleme ile birlikte Clash Deckster'ın zekasını bir üst seviyeye taşıyoruz! Artık oyunun zirvesinde neler döndüğünü sadece tahmin etmiyoruz, **biliyoruz.** Altyapımızda yaptığımız devasa geliştirmeler sayesinde Deckster artık dünyanın en iyi oyuncularını yakından takip ediyor.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-surface-container/50 p-5 rounded-xl border border-surface-container-high">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-primary text-2xl">radar</span>
                  <h3 className="text-xl font-bold text-white">Canlı Meta Takibi</h3>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Deckster artık dünyanın en iyi oyuncularından ilham alıyor. Sana önerilen desteler ve yapılan analizler, Efsaneler Yolu'ndaki (Path of Legend) en güncel trendlere göre gerçek zamanlı olarak şekilleniyor.
                </p>
              </div>

              <div className="bg-surface-container/50 p-5 rounded-xl border border-surface-container-high">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-tertiary text-2xl">psychology</span>
                  <h3 className="text-xl font-bold text-white">Gelişmiş Deste Anlayışı</h3>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Yapay zekamız desteleri sadece bir kart yığını olarak görmekten çıktı. Artık destelerin "ruhunu", oyun stilini ve kazanma stratejisini anlayarak sana çok daha tutarlı taktikler sunuyor.
                </p>
              </div>

              <div className="bg-surface-container/50 p-5 rounded-xl border border-surface-container-high">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">bolt</span>
                  <h3 className="text-xl font-bold text-white">Hızlı ve Kesintisiz</h3>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Arka planda yaptığımız devasa güçlendirmelerle birlikte analiz süreçlerimiz artık eskisinden çok daha hızlı ve akıcı. Binlerce olasılık saniyeler içinde taranıyor.
                </p>
              </div>

              <div className="bg-surface-container/50 p-5 rounded-xl border border-surface-container-high">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-error text-2xl">bug_report</span>
                  <h3 className="text-xl font-bold text-white">Hata Düzeltmeleri</h3>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Sistem stabilitesini artırdık, API bağlantı hızlarını optimize ettik ve bazı destelerin algılanmasında yaşanan ufak tefek pürüzleri giderdik.
                </p>
              </div>

            </div>
          </div>
          
          {/* Placeholder for future versions */}
          <div className="relative pl-6 md:pl-8 border-l-2 border-surface-container-highest opacity-50">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-surface-container-highest"></div>
            <h2 className="text-2xl font-headline font-bold text-white tracking-wide mb-2">
              v1.2.2 
            </h2>
            <p className="text-on-surface-variant">
              Oyuncu istatistikleri ve gelişmiş klan arayüzleri eklendi.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReleaseNotes;
