import bcrypt from 'bcrypt';

/**
 * Hashes a password using bcrypt and prints the result.
 *
 * Usage: tsx src/scripts/hash-password.ts <password>
 *
 * Note: The seed.sql file uses the password "password" for the default user.
 * If you need to update the seed file, run this script with "password" as the argument.
 */
async function main() {
  const args = process.argv.slice(2);
  let password: string | undefined = args[0];

  if (!password) {
    // Prompt for password if not provided as argument
    process.stdout.write('Enter password to hash: ');
    password = await new Promise<string>((resolve) => {
      process.stdin.once('data', (data) => {
        resolve(data.toString().trim());
      });
    });
  }

  if (!password) {
    console.error('No password provided.');
    process.exit(1);
  }

  const saltRounds = 10;
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Hashed password:', hash);
    console.log('');
    console.log(
      'To use this hash in seed.sql, replace the encrypted_password value with:'
    );
    console.log(hash);
  } catch (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  process.exit(0);
}

main();
