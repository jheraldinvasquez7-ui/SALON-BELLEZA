import { createApp } from 'vue'
import { Quasar, Notify, Dialog } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'

createApp(App)
	.use(pinia)
	.use(router)
	.use(Quasar, {
		plugins: { Notify, Dialog },
		config: {
			brand: {
				primary: '#376b5b',
				secondary: '#d18b70',
				accent: '#d5a94e',
				dark: '#27332e',
			},
		},
	})
	.mount('#app')
