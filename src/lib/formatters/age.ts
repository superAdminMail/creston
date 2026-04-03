export function calculateAgeFromDate(dateOfBirth: Date, today = new Date()) {
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1;
  }

  return age;
}

export function getAgeFromIsoDate(dateOfBirth: string) {
  if (!dateOfBirth) return null;

  const parsedDate = new Date(`${dateOfBirth}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return calculateAgeFromDate(parsedDate);
}
