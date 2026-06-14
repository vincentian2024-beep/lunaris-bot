export function formatPhp(centavos: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(centavos / 100);
}

export function parsePhp(value: string): number {
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(value.trim())) {
    throw new Error("Enter a valid PHP amount, for example 500 or 500.00.");
  }
  const centavos = Math.round(Number(value) * 100);
  if (centavos < 100) throw new Error("The minimum top-up is ₱1.00.");
  return centavos;
}
