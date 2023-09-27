export const channelId = new URL(window.location.href).pathname.slice(1);
export const socket = new WebSocket(`ws://localhost:3000/${new URL(window.location.href).pathname.slice(1)}`)
