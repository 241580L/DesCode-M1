
function generatePassword(length = 12) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=';
  const all = upper + lower + numbers + symbols;

  if (length < 8) length = 8;

  // Ensure at least one uppercase, one number
  let password = '';
  password += upper.charAt(Math.floor(Math.random() * upper.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));

  // Fill the rest
  for (let i = 2; i < length; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length));
  }

  // Shuffle password
  password = password.split('').sort(() => Math.random() - 0.5).join('');
  return password;
}

module.exports = generatePassword;
