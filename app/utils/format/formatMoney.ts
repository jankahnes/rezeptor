export default function formatMoney(amount: number | undefined | null): string {
  if (amount) {
    return (amount.toFixed(2) + '€').replace('.', ',');
  }
  return '0,00 €';
}
