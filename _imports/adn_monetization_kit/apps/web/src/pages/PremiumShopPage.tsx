import { useEffect, useState } from "react";

type Product = {
  label: string;
  priceStars: number;
  grantType: string;
  grantKey: string;
};

const API_URL = import.meta.env.VITE_API_URL;

export default function PremiumShopPage() {
  const [products, setProducts] = useState<Record<string, Product>>({});

  useEffect(() => {
    fetch(`${API_URL}/payments/products`)
      .then((r) => r.json())
      .then((d) => setProducts(d.items || {}));
  }, []);

  async function buy(productKey: string) {
    const res = await fetch(`${API_URL}/payments/stars/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productKey }),
    }).then((r) => r.json());

    alert(`Invoice hazır: ${res.title} (${res.currency} ${res.prices?.[0]?.amount})`);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Premium Shop</h1>
      <div style={{ display: "grid", gap: 12 }}>
        {Object.entries(products).map(([key, p]) => (
          <div key={key} style={{ border: "1px solid #333", borderRadius: 12, padding: 16 }}>
            <strong>{p.label}</strong>
            <div>{p.priceStars} Stars</div>
            <button onClick={() => buy(key)}>Buy</button>
          </div>
        ))}
      </div>
    </div>
  );
}
