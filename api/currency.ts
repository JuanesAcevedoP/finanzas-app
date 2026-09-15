export async function convertToCOP(amount: number, fromCurrency: string): Promise<number> {
  const currency = fromCurrency.trim().toUpperCase();
  if (currency === "COP") return Math.round(amount);

  const response = await fetch(`https://open.er-api.com/v6/latest/${currency}`);
  if (!response.ok) throw new Error("No se pudo consultar la tasa de cambio");

  const data = await response.json();
  const rate = data?.rates?.COP;
  if (!rate) throw new Error(`No se encontró tasa de cambio para ${currency}`);

  return Math.round(amount * rate);
}
