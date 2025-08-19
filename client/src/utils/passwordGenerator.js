import http from '../http';

// Returns a Promise that resolves to an AI-generated password
export async function generatePassword(length = 12) {
  try {
    const response = await http.post('/ai/ai-password', { length });
    return response.data.password;
  } catch (err) {
    // fallback to local generation if AI fails
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=';
    const all = upper + lower + numbers + symbols;
    if (length < 8) length = 8;
    let password = '';
    password += upper.charAt(Math.floor(Math.random() * upper.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    for (let i = 2; i < length; i++) {
      password += all.charAt(Math.floor(Math.random() * all.length));
    }
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    return password;
  }
}
