// Import global styles
import '../src/app.css';
import '../src/lib/styles/markdown.css';

/** @type { import('@storybook/sveltekit').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0A0E0D',
        },
        {
          name: 'light',
          value: '#F7F3E9',
        },
      ],
    },
  },
};

export default preview;