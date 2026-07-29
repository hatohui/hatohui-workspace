import figlet from 'figlet';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';

export function printBanner(port: number): void {
  const art = figlet.textSync('Hatohui API', { font: 'Standard' });

  console.log(`\n${YELLOW}${art}${RESET}`);
  console.log(
    `${BOLD}${YELLOW}  :: Hatohui API ::${RESET}${DIM}  hatohui-workspace backend${RESET}\n`,
  );
  console.log(
    `  ${CYAN}Environment${RESET}  ${process.env.NODE_ENV ?? 'development'}`,
  );
  console.log(`  ${CYAN}Port       ${RESET}  ${port}`);
  console.log(
    `  ${CYAN}Docs       ${RESET}  ${GREEN}http://localhost:${port}/docs${RESET}\n`,
  );
}
