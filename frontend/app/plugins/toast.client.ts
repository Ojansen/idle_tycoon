export default defineNuxtPlugin(() => {
  const toast = useToast()
  toast.settings({
    position: 'topCenter',
    timeout: 4000,
    transitionIn: 'fadeInDown',
    transitionOut: 'fadeOutUp',
    backgroundColor: 'rgba(15, 10, 30, 0.92)',
    theme: 'dark',
    progressBarColor: 'rgb(139, 92, 246)',
    titleColor: '#e4e4e7',
    messageColor: '#a1a1aa',
    iconColor: 'rgb(139, 92, 246)',
    balloon: false
  })
})
