import React, { useState } from 'react';
import tokenImage from '../assets/adn-token-clean.png';

type Section = 'terms' | 'faq';

const TERMS_TR = `
**1. Kabul**
ADN Token uygulamasını kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Kabul etmiyorsanız uygulamayı kullanmayınız.

**2. Hizmet Tanımı**
ADN Token, Telegram üzerinden erişilen bir ödül ve oyun motorudur. Kullanıcılar tap, görev ve referral yoluyla ADN puanı kazanır.

**3. Kullanıcı Yükümlülükleri**
- Sistemi otomatik araçlar, bot veya hile yazılımlarıyla kullanmak yasaktır.
- Tek bir kişi yalnızca bir hesap açabilir.
- Yanıltıcı referral veya sahte hesap oluşturmak hesabın kalıcı olarak kapatılmasına yol açar.

**4. Puan ve Ödüller**
ADN puanları oyun içi bir değer taşır. Gerçek para veya kripto para birimi değildir. Airdrop dağıtımları proje ekibinin takdirine bağlıdır ve önceden duyurulur.

**5. Hesap Askıya Alma**
Kural ihlali tespit edildiğinde hesap uyarısız askıya alınabilir veya kalıcı olarak kapatılabilir.

**6. Sorumluluk Reddi**
Uygulama "olduğu gibi" sunulmaktadır. Teknik kesintiler, veri kayıpları veya puan iptalleri nedeniyle sorumluluk kabul edilmez.

**7. Değişiklikler**
Bu koşullar önceden bildirim yapılmaksızın güncellenebilir. Güncel versiyon her zaman uygulama içinde yayınlanır.

**8. İletişim**
Sorularınız için Telegram üzerinden destek kanalımıza ulaşabilirsiniz.
`;

const FAQ_ITEMS = [
  {
    q: 'ADN Token nedir?',
    a: 'ADN Token, Telegram üzerinde çalışan bir tap-to-earn ödül motorudur. Tap yaparak, görev tamamlayarak ve arkadaş davet ederek ADN puanı kazanırsınız.'
  },
  {
    q: 'Kazandığım ADN puanları gerçek para mı?',
    a: 'Hayır. ADN puanları şu an için oyun içi bir değer taşır. Airdrop dağıtımı proje roadmap\'ine göre duyurulacaktır.'
  },
  {
    q: 'Enerji nasıl yenilenir?',
    a: 'Enerji zaman içinde otomatik olarak yenilenir. Boost satın alarak veya günlük ödülü toplayarak enerji yenileme hızını artırabilirsiniz.'
  },
  {
    q: 'Referral sistemi nasıl çalışır?',
    a: 'Davet bağlantınızı paylaşarak arkadaşlarınızı davet edebilirsiniz. Davet ettiğiniz kişi oyuna katıldığında her iki taraf da bonus ADN kazanır.'
  },
  {
    q: 'Chest (sandık) nedir?',
    a: 'Tap yaparken rastgele chest düşebilir. Chest\'leri açarak ekstra ADN, shard ve boost dakikası kazanabilirsiniz. Nadir chest\'ler daha yüksek ödül verir.'
  },
  {
    q: 'Prestige / Reboot nedir?',
    a: 'Belirli bir seviyeye ulaştığınızda Reboot yapabilirsiniz. Reboot ile kalıcı güç bonusu kazanırsınız ve oyun daha yüksek bir güç katmanından yeniden başlar.'
  },
  {
    q: 'Claim (çekim) nasıl yapılır?',
    a: 'Minimum puan eşiğine ulaştığınızda Wallet sekmesinden cüzdan adresinizi girerek çekim talebinde bulunabilirsiniz. Talepler snapshot sonrası işleme alınır.'
  },
  {
    q: 'Hesabım neden askıya alındı?',
    a: 'Bot kullanımı, çoklu hesap veya hile tespiti durumunda hesaplar askıya alınabilir. İtiraz için destek kanalımıza ulaşın.'
  },
  {
    q: 'Günlük ödül nasıl alınır?',
    a: 'Her gün uygulamaya girerek Görevler sekmesinden günlük ödülünüzü talep edebilirsiniz. Seriyi kırmadan devam etmek daha yüksek ödül verir.'
  },
  {
    q: 'Combo sistemi ne işe yarar?',
    a: 'Hızlı ve ritmik tap yaparak combo çarpanı oluşturabilirsiniz. Combo aktifken her tap daha fazla ADN üretir.'
  }
];

export default function TermsPage() {
  const [section, setSection] = useState<Section>('faq');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{
      minHeight: 'var(--tg-viewport-height, 100vh)',
      background: 'linear-gradient(180deg, #07111F 0%, #0B1220 100%)',
      color: '#F3F7FB',
      fontFamily: 'var(--adn-body-font, "Space Grotesk", sans-serif)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(16px)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => window.history.back()}
          style={{
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '8px 12px',
            color: '#A6B4C3',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          ← Geri
        </button>
        <img src={tokenImage} alt="ADN" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'contain' }} />
        <span style={{ fontWeight: 700, fontSize: 15 }}>ADN Token</span>
      </div>

      {/* Tab switcher */}
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '14px 16px 0',
        flexShrink: 0,
      }}>
        {(['faq', 'terms'] as Section[]).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            style={{
              padding: '10px 20px',
              borderRadius: 999,
              border: '1px solid',
              borderColor: section === s ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.1)',
              background: section === s
                ? 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(59,130,246,0.15))'
                : 'rgba(255,255,255,0.04)',
              color: section === s ? '#38BDF8' : '#A6B4C3',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            {s === 'faq' ? '❓ SSS' : '📄 Kullanım Koşulları'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>

        {section === 'faq' && (
          <div style={{ display: 'grid', gap: 10, maxWidth: 720, margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 4px', fontFamily: 'var(--adn-title-font, Orbitron)', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', color: '#F3F7FB' }}>
              Sık Sorulan Sorular
            </h2>
            <p style={{ margin: '0 0 16px', color: '#6E8097', fontSize: 13 }}>
              ADN Token hakkında merak ettiğiniz her şey.
            </p>
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 20,
                  border: '1px solid',
                  borderColor: openFaq === i ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.08)',
                  background: openFaq === i
                    ? 'linear-gradient(180deg, rgba(56,189,248,0.08), rgba(7,17,31,0.9))'
                    : 'rgba(255,255,255,0.04)',
                  overflow: 'hidden',
                  transition: 'border-color 200ms ease',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '14px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#F3F7FB',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{item.q}</span>
                  <span style={{
                    flexShrink: 0,
                    color: '#38BDF8',
                    fontSize: 18,
                    transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms ease',
                  }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{
                    padding: '0 16px 16px',
                    color: '#A6B4C3',
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {section === 'terms' && (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 4px', fontFamily: 'var(--adn-title-font, Orbitron)', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', color: '#F3F7FB' }}>
              Kullanım Koşulları
            </h2>
            <p style={{ margin: '0 0 20px', color: '#6E8097', fontSize: 13 }}>
              Son güncelleme: Nisan 2026
            </p>
            <div style={{
              borderRadius: 24,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              padding: '20px 20px',
              display: 'grid',
              gap: 16,
            }}>
              {TERMS_TR.trim().split('\n\n').map((block, i) => {
                const lines = block.trim().split('\n');
                return (
                  <div key={i}>
                    {lines.map((line, j) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <p key={j} style={{ margin: '0 0 6px', fontWeight: 800, color: '#F3F7FB', fontSize: 14 }}>
                            {line.replace(/\*\*/g, '')}
                          </p>
                        );
                      }
                      return (
                        <p key={j} style={{ margin: 0, color: '#A6B4C3', fontSize: 13, lineHeight: 1.7 }}>
                          {line}
                        </p>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        color: '#6E8097',
        fontSize: 11,
        letterSpacing: '0.08em',
        flexShrink: 0,
      }}>
        ADN TOKEN © 2026
      </div>
    </div>
  );
}
