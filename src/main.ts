import { mount } from 'svelte';
import App from './App.svelte';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame-dark.css';
import './app.css';

mount(App, { target: document.getElementById('app')! });
