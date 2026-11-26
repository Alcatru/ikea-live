/* IKEA live – shared logic: config, broker connection, profiles, content. */
(function () {
  const Q = new URLSearchParams(location.search);
  const CFG = {
    broker: Q.get("broker") || "wss://broker.hivemq.com:8884/mqtt",
    room: (Q.get("room") || "hej-unifr-7q4k").replace(/[^a-z0-9-]/gi, ""),
  };
  CFG.base = "ikea-live/" + CFG.room;
  const PHASES = ["join", "s0", "s1", "s2", "s3", "s4", "s5", "end"];

  /* Profiles mirror the deck's "blue box assumption" badge: Car, Time, Space, Travel. */
  const PROFILES = {
    lena: {
      name: "Lena", age: 22, role: "Student", home: "24 m² studio, Bern old town",
      car: false, ok: { Car: false, Time: true, Space: false, Travel: false }, w: 3, urban: true,
      need: "Lives in the city and doesn't drive",
    },
    jonas: {
      name: "Jonas", age: 29, role: "Junior consultant", home: "2-room flat, Bern Länggasse",
      car: false, ok: { Car: false, Time: false, Space: false, Travel: true }, w: 3, urban: true,
      need: "Has very little time for shopping",
    },
    amira: {
      name: "Amira", age: 26, role: "Nurse, shift work", home: "Shared flat, Bern Breitenrain",
      car: false, ok: { Car: false, Time: false, Space: false, Travel: false }, w: 2, urban: true,
      need: "Small space, no car, irregular hours",
    },
    family: {
      name: "Sofia & Marc", age: null, role: "Family, two kids", home: "House with garden near Burgdorf",
      car: true, ok: { Car: true, Time: true, Space: true, Travel: true }, w: 2, urban: false,
      need: "The classic IKEA customer",
    },
  };
  const ASSUMPTIONS = ["Car", "Time", "Space", "Travel"];

  function pickProfile() {
    const keys = Object.keys(PROFILES);
    const tot = keys.reduce((s, k) => s + PROFILES[k].w, 0);
    let r = Math.random() * tot;
    for (const k of keys) { r -= PROFILES[k].w; if (r <= 0) return k; }
    return keys[0];
  }

  const QUESTIONS = {
    before: {
      q: "Still the right model today?",
      opts: [["keep", "keep", "Yes, keep it"], ["change", "change", "No, change it"], ["unsure", "unsure", "Not sure"]],
    },
    home: {
      q: "Where do you live?",
      opts: [["centre", "centre", "City centre"], ["suburbs", "suburbs", "Suburbs"], ["country", "country", "Countryside"]],
    },
    got: {
      q: "Last piece of furniture you bought: how did it get home?",
      opts: [["car", "car", "My car"], ["lift", "lift", "Someone drove me"], ["delivery", "delivery", "Delivered"], ["carried", "carried", "I carried it"]],
    },
    react: {
      q: "Not in stock today. Delivered later. OK for you?",
      opts: [["fine", "fine", "Fine"], ["meh", "meh", "Meh"], ["angry", "angry", "I want it now"]],
    },
  };
  QUESTIONS.after = { q: "And now: big stores outside the city. Still the right model?", opts: QUESTIONS.before.opts };

  /* Store zones, one per Step. */
  const ZONES = {
    s0: { n: 0, title: "The blue box", step: "Step 0 · Unboxing IKEA" },
    s1: { n: 1, title: "Cities grow", step: "Step 1 · Why rebuild?" },
    s2: { n: 2, title: "A studio in town", step: "Step 2 · Designed for customers" },
    s3: { n: 3, title: "Waiting for delivery", step: "Step 3 · Assembly challenges" },
    s4: { n: 4, title: "Will it fit?", step: "Step 4 · Beyond the furniture" },
    s5: { n: 5, title: "Your journey", step: "Step 5 · Recommendations" },
    end: { n: 5, title: "Final vote", step: "After our recommendations" },
  };

  function uid() {
    return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem("ikealive:" + k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem("ikealive:" + k, JSON.stringify(v)); } catch (e) {} },
  };

  /* Thin wrapper around mqtt.js. onState(state), onRecord(id, rec). */
  function connect(opts) {
    const client = mqtt.connect(CFG.broker, {
      clientId: "ikl_" + uid(), clean: true, reconnectPeriod: 1500, connectTimeout: 8000, keepalive: 30,
    });
    const api = { client, state: null, run: null, connected: false };
    const recTopic = (run) => CFG.base + "/run/" + run + "/p/+";
    client.on("connect", () => {
      api.connected = true; opts.onStatus && opts.onStatus(true);
      client.subscribe(CFG.base + "/state", { qos: 1 });
      if (api.run && opts.onRecord) client.subscribe(recTopic(api.run), { qos: 1 });
    });
    client.on("close", () => { api.connected = false; opts.onStatus && opts.onStatus(false); });
    client.on("offline", () => { api.connected = false; opts.onStatus && opts.onStatus(false); });
    client.on("message", (topic, payload) => {
      let data = null;
      try { data = payload.length ? JSON.parse(payload.toString()) : null; } catch (e) { return; }
      if (topic === CFG.base + "/state") {
        if (!data) return;
        if (opts.onRecord && data.run !== api.run) {
          if (api.run) client.unsubscribe(recTopic(api.run));
          client.subscribe(recTopic(data.run), { qos: 1 });
        }
        api.state = data; api.run = data.run;
        opts.onState && opts.onState(data);
      } else if (opts.onRecord) {
        const m = topic.match(/\/run\/([^/]+)\/p\/([^/]+)$/);
        if (m && m[1] === api.run) opts.onRecord(m[2], data);
      }
    });
    api.publishState = (st) => client.publish(CFG.base + "/state", JSON.stringify(st), { qos: 1, retain: true });
    api.publishRecord = (run, id, rec) =>
      client.publish(CFG.base + "/run/" + run + "/p/" + id, JSON.stringify(rec), { qos: 1, retain: true });
    return api;
  }

  /* Aggregate phone records for the screen. */
  function tally(records) {
    const out = { n: 0, before: {}, home: {}, got: {}, react: {}, after: {} };
    for (const id in records) {
      const r = records[id]; if (!r || !r.a) continue;
      out.n++;
      for (const k of ["before", "home", "got", "react", "after"]) {
        const v = r.a && r.a[k]; if (v) out[k][v] = (out[k][v] || 0) + 1;
      }
    }
    return out;
  }

  /* Fake records for rehearsal / backup screenshots (?demo=40). */
  function demoRecords(n, phase) {
    const idx = PHASES.indexOf(phase), recs = {}, pick = (a) => a[Math.floor(Math.random() * a.length)];
    for (let i = 0; i < n; i++) {
      const a = {};
      a.before = pick(["keep", "keep", "change", "unsure"]);
      a.home = pick(["centre", "centre", "centre", "suburbs", "suburbs", "country"]);
      if (idx >= 1) a.got = pick(["car", "lift", "lift", "delivery", "carried", "carried"]);
      if (idx >= 4) a.react = pick(["fine", "meh", "angry", "angry"]);
      if (idx >= 7) a.after = pick(["change", "change", "change", "keep", "unsure"]);
      recs["demo" + i] = { a };
    }
    return recs;
  }

  window.IKL = { CFG, Q, PHASES, PROFILES, ASSUMPTIONS, QUESTIONS, ZONES, pickProfile, uid, store, connect, tally, demoRecords };
})();
