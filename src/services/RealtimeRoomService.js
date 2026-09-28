import { createClient } from '@supabase/supabase-js';

class RealtimeRoomService {
  constructor() {
    const env = import.meta.env || {};
    this.url = env.VITE_SUPABASE_URL || '';
    this.publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
    this.client = this.url && this.publishableKey
      ? createClient(this.url, this.publishableKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        })
      : null;
    this.channel = null;
    this.roomId = null;
    this.status = this.client ? 'idle' : 'local';
    this.pendingMessages = [];
  }

  isConfigured() {
    return !!this.client;
  }

  isConnected() {
    return this.status === 'connected' && !!this.channel;
  }

  async connect(roomId, player, { onMessage, onStatus } = {}) {
    if (!this.client || !roomId || !player) return false;
    await this.disconnect();

    this.roomId = String(roomId).trim().toUpperCase();
    this.status = 'connecting';
    if (onStatus) onStatus(this.status);

    const channel = this.client.channel(`math-mama-room:${this.roomId}`, {
      config: {
        private: false,
        broadcast: { ack: true, self: false },
        presence: { key: player.id }
      }
    });
    this.channel = channel;

    channel
      .on('broadcast', { event: 'room-event' }, ({ payload }) => {
        if (this.channel !== channel) return;
        if (payload && onMessage) onMessage(payload);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        if (this.channel !== channel) return;
        for (const presence of newPresences || []) {
          if (!presence?.id || presence.id === player.id) continue;
          if (onMessage) onMessage({
            type: 'PLAYER_JOINED',
            roomId: this.roomId,
            player: this.toPlayer(presence)
          });
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        if (this.channel !== channel) return;
        for (const presence of leftPresences || []) {
          if (!presence?.id || presence.id === player.id) continue;
          if (onMessage) onMessage({
            type: 'PLAYER_LEFT',
            roomId: this.roomId,
            playerId: presence.id
          });
        }
      })
      .subscribe(async (status, error) => {
        if (this.channel !== channel) return;
        if (status === 'SUBSCRIBED') {
          this.status = 'connected';
          await this.updatePresence(player);
          await this.flushPending();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.status = 'error';
          console.warn('Supabase Realtime room connection failed:', error || status);
        } else if (status === 'CLOSED') {
          this.status = 'closed';
        }
        if (onStatus) onStatus(this.status, error);
      });

    return true;
  }

  toPlayer(presence) {
    return {
      id: presence.id,
      name: presence.name || 'Chef',
      role: presence.role || 'math',
      isHost: !!presence.isHost,
      isReady: presence.isReady !== false,
      isObservant: !!presence.isObservant
    };
  }

  async send(payload) {
    if (!this.channel || this.status !== 'connected') {
      // The waiting screen retries the same request while offline. Keep one
      // pending copy; the host's request ID also makes delivery idempotent.
      const pendingIndex = payload.type === 'CLASSROOM_QUESTION_REQUEST'
        ? this.pendingMessages.findIndex(message =>
            message.type === payload.type && message.roomId === payload.roomId && message.requestId === payload.requestId)
        : -1;
      if (pendingIndex >= 0) this.pendingMessages[pendingIndex] = payload;
      else this.pendingMessages.push(payload);
      if (this.pendingMessages.length > 20) this.pendingMessages.shift();
      return false;
    }
    const result = await this.channel.send({
      type: 'broadcast',
      event: 'room-event',
      payload
    });
    return result === 'ok';
  }

  async flushPending() {
    const messages = this.pendingMessages.splice(0);
    for (const payload of messages) await this.send(payload);
  }

  async updatePresence(player) {
    if (!this.isConnected() || !player) return;
    await this.channel.track({
      id: player.id,
      name: player.name,
      role: player.role,
      isHost: !!player.isHost,
      isReady: !!player.isReady,
      isObservant: !!player.isObservant,
      onlineAt: new Date().toISOString()
    });
  }

  async disconnect() {
    this.pendingMessages = [];
    if (this.channel && this.client) {
      try { await this.channel.untrack(); } catch (error) {}
      try { await this.client.removeChannel(this.channel); } catch (error) {}
    }
    this.channel = null;
    this.roomId = null;
    this.status = this.client ? 'idle' : 'local';
  }
}

export const realtimeRoomService = new RealtimeRoomService();
export default realtimeRoomService;
