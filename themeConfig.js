// Theme Colors
// Initially this will be blank. Later on when app is initialized we will assign bootstrap colors to this from CSS variables.
export const $themeColors = {}

// App Breakpoints
// Initially this will be blank. Later on when app is initialized we will assign bootstrap breakpoints to this object from CSS variables.
export const $themeBreakpoints = {}

// APP CONFIG
export const $themeConfig = {
  app: {
    appName: 'Synapsis',
    // eslint-disable-next-line global-require
    appLogoImage: require('@/assets/images/logo/logo.png'),
  },
  layout: {
    isRTL: false,
    skin: 'light',
    routerTransition: 'fade', // zoom-fade, slide-fade, fade-bottom, fade, zoom-out, none
    type: 'vertical',
    contentWidth: 'full',
    menu: {
      hidden: false,
      isCollapsed: false,
    },
    navbar: {
      type: 'floating',
      backgroundColor: '',
    },
    footer: {
      type: 'static',
    },
    customizer: true,
    enableScrollToTop: true,
  },
}
