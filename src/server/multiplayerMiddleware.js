// LAN Multiplayer Middleware for cross-device Co-op over Wi-Fi
// Uses Node built-in HTTP and Server-Sent Events (SSE) — Zero external dependencies

const rooms = new Map();

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function broadcastToRoom(roomId, message, excludeRes = null) {
  const room = rooms.get(roomId);
  if (!room || !room.subscribers) return;

  const payload = `data: ${JSON.stringify(message)}\n\n`;
  for (const client of Array.from(room.subscribers)) {
    if (client.res === excludeRes) continue;
    try {
      client.res.write(payload);
      if (typeof client.res.flush === 'function') {
        client.res.flush();
      }
    } catch (err) {
      room.subscribers.delete(client);
    }
  }
}

export function registerMultiplayerRoutes(middlewares) {
  middlewares.use((req, res, next) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    // 1. SSE Events Stream: GET /api/multiplayer/events?roomId=XXX&playerId=YYY
    if (pathname === '/api/multiplayer/events' && req.method === 'GET') {
      const rawRoomId = (parsedUrl.searchParams.get('roomId') || '').trim().toUpperCase();
      const roomId = rawRoomId.replace(/^WM-/, '');
      const playerId = (parsedUrl.searchParams.get('playerId') || '').trim();

      if (!roomId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing roomId' }));
        return;
      }

      console.log(`[LAN SERVER] SSE Connect: room=${roomId} player=${playerId}`);

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*'
      });
      if (typeof res.flushHeaders === 'function') {
        res.flushHeaders();
      }
      res.write(`data: ${JSON.stringify({ type: 'CONNECTED', roomId })}\n\n`);
      if (typeof res.flush === 'function') {
        res.flush();
      }

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          data: {
            roomId,
            status: 'WAITING',
            players: [],
            unlockedSteps: [0],
            mathAccuracy: 1.0,
            cookingAccuracy: 1.0
          },
          subscribers: new Set()
        });
      }

      const room = rooms.get(roomId);
      const client = { res, playerId };
      room.subscribers.add(client);

      // If room already has data, push immediately to the new client
      if (room.data && room.data.players && room.data.players.length > 0) {
        res.write(`data: ${JSON.stringify({ type: 'SYNC_STATE', room: room.data })}\n\n`);
        if (typeof res.flush === 'function') {
          res.flush();
        }
      }

      // Keep connection alive with heartbeat every 15s
      const heartbeat = setInterval(() => {
        try {
          res.write(': heartbeat\n\n');
        } catch (e) {
          clearInterval(heartbeat);
          room.subscribers.delete(client);
        }
      }, 15000);

      req.on('close', () => {
        clearInterval(heartbeat);
        room.subscribers.delete(client);
        console.log(`[LAN SERVER] SSE Disconnect: room=${roomId} player=${playerId}`);
      });
      return;
    }

    // 2. Action Endpoint: POST /api/multiplayer/action
    if (pathname === '/api/multiplayer/action' && req.method === 'POST') {
      parseJsonBody(req).then(body => {
        const rawRoomId = (body.roomId || '').trim().toUpperCase();
        const roomId = rawRoomId.replace(/^WM-/, '');
        if (!roomId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing roomId' }));
          return;
        }

        console.log(`[LAN SERVER] Action: type=${body.type} room=${roomId} player=${body.player?.name || body.playerId || ''}`);

        if (!rooms.has(roomId)) {
          rooms.set(roomId, {
            data: {
              roomId,
              status: 'WAITING',
              players: [],
              unlockedSteps: [0],
              mathAccuracy: 1.0,
              cookingAccuracy: 1.0
            },
            subscribers: new Set()
          });
        }

        const room = rooms.get(roomId);

        switch (body.type) {
          case 'SYNC_STATE':
            if (body.room) {
              const incomingPlayers = body.room.players || [];
              const currentPlayers = room.data.players || [];
              const merged = [...currentPlayers];
              for (const p of incomingPlayers) {
                const idx = merged.findIndex(m => m.id === p.id);
                if (idx >= 0) {
                  merged[idx] = { ...merged[idx], ...p };
                } else {
                  merged.push(p);
                }
              }
              room.data = {
                ...room.data,
                ...body.room,
                players: merged
              };
            }
            break;

          case 'PLAYER_JOINED':
            if (body.player) {
              const existingIdx = room.data.players.findIndex(p => p.id === body.player.id);
              if (existingIdx >= 0) {
                room.data.players[existingIdx] = { ...room.data.players[existingIdx], ...body.player };
              } else {
                room.data.players.push(body.player);
              }
            }
            break;

          case 'PLAYER_UPDATE':
            if (body.player) {
              const idx = room.data.players.findIndex(p => p.id === body.player.id);
              if (idx >= 0) {
                room.data.players[idx] = { ...room.data.players[idx], ...body.player };
              }
            }
            break;

          case 'PLAYER_LEFT':
          case 'KICK_PLAYER':
            if (body.playerId) {
              room.data.players = room.data.players.filter(p => p.id !== body.playerId);
            }
            break;

          case 'START_GAME':
            room.data.status = 'PLAYING';
            if (body.missionId) room.data.missionId = body.missionId;
            break;

          case 'STEP_UNLOCKED':
            room.data.unlockedSteps = room.data.unlockedSteps || [];
            if (!room.data.unlockedSteps.includes(body.stepIndex)) {
              room.data.unlockedSteps.push(body.stepIndex);
            }
            if (body.accuracy !== undefined) {
              room.data.mathAccuracy = body.accuracy;
            }
            break;

          case 'COOP_FINISHED':
            room.data.status = 'RESULT';
            if (body.metrics) room.data.resultMetrics = body.metrics;
            break;
        }

        // Broadcast to all connected clients in this room (Host & Joiners)
        broadcastToRoom(roomId, body);
        // Also broadcast full sync to ensure 100% consistency
        broadcastToRoom(roomId, { type: 'SYNC_STATE', room: room.data });

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ ok: true, room: room.data }));
      });
      return;
    }

    // 3. Room Status Query: GET /api/multiplayer/room?roomId=XXX
    if (pathname === '/api/multiplayer/room' && req.method === 'GET') {
      const rawRoomId = (parsedUrl.searchParams.get('roomId') || '').trim().toUpperCase();
      const roomId = rawRoomId.replace(/^WM-/, '');
      const room = rooms.get(roomId);
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        ok: true,
        exists: !!room,
        room: room ? room.data : null
      }));
      return;
    }

    next();
  });
}

export default registerMultiplayerRoutes;
