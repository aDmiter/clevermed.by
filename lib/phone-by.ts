/** Локальная часть: 2 + 3 + 2 + 2 цифры после +375 */
export const BY_PHONE_DIGITS_LEN = 9;

/** Префикс в поле при фокусе (код страны уже подставлен). */
export const BY_PHONE_PREFIX = "+375 (";

/** Пример только локальной части — без +375. */
export const BY_PHONE_LOCAL_PLACEHOLDER = "(29) 123-45-67";

/** Полный пример (подсказки, документация). */
export const BY_PHONE_PLACEHOLDER = `${BY_PHONE_PREFIX}29) 123-45-67`;

/** Извлекает до 9 цифр номера без кода страны. */
export function digitsFromBelarusPhone(value: string): string {
  let rest = value.replace(/\D/g, "");
  if (rest.startsWith("375")) rest = rest.slice(3);
  return rest.slice(0, BY_PHONE_DIGITS_LEN);
}

/** Формат: +375 (XX) XXX-XX-XX */
export function formatBelarusPhone(digits: string): string {
  const d = digits.slice(0, BY_PHONE_DIGITS_LEN);
  if (d.length === 0) return "";

  let out = "+375 (";
  if (d.length <= 2) return out + d;

  out += `${d.slice(0, 2)}) `;
  if (d.length <= 5) return out + d.slice(2);

  out += `${d.slice(2, 5)}-`;
  if (d.length <= 7) return out + d.slice(5);

  return `${out}${d.slice(5, 7)}-${d.slice(7, 9)}`;
}

export function isBelarusPhoneComplete(digits: string): boolean {
  return digits.length === BY_PHONE_DIGITS_LEN;
}

/** Значение для input: при фокусе без цифр показываем префикс +375 (. */
export function formatBelarusPhoneDisplay(
  digits: string,
  focused: boolean,
): string {
  if (digits.length === 0) {
    return focused ? BY_PHONE_PREFIX : "";
  }
  return formatBelarusPhone(digits);
}
