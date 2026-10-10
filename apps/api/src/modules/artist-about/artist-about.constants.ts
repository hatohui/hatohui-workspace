export const ABOUT_HEADLINE_MAX_LENGTH = 120;
export const ABOUT_INTRO_MAX_LENGTH = 500;
export const ABOUT_BODY_MAX_LENGTH = 10_000;
export const ABOUT_FACT_MAX_LENGTH = 80;
export const ABOUT_FACTS_MAX_COUNT = 12;

export const ABOUT_DEFAULTS = {
  headline: 'Lorem ipsum dolor sit amet',
  intro:
    'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  body: [
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
    'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
  ].join('\n\n'),
  facts: ['Lorem ipsum', 'Dolor sit amet', 'Consectetur', 'Adipiscing elit'],
};
