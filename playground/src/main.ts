import { createApp } from 'vue'
import App from './App.vue'
import 'uno.css'
import './main.css'
import 'splitpanes/dist/splitpanes.css'
import { version} from '@cc-heart/object-to-declare'

console.log('object to declare version: ' + version)
const app = createApp(App)


app.mount('#app')
