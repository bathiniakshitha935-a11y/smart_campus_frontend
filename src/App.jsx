import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const fallbackLocations = [
  { id: 1, name: "Main Entrance", type: "Entrance", description: "Main entrance opposite A Block." },
  { id: 2, name: "A Block", type: "Block", description: "Straight ahead from the main entrance." },
  { id: 3, name: "B Block", type: "Block", description: "Reach B Block by taking the left route from A Block." },
  { id: 4, name: "C Block", type: "Block", description: "Left from B Block; near the ground and football court." },
  { id: 5, name: "D Block", type: "Block", description: "Continue beyond C Block toward D Block." },
  { id: 6, name: "E Block", type: "Block", description: "On the E–F–G road/row." },
  { id: 7, name: "F Block", type: "Block", description: "On the E–F–G road/row." },
  { id: 8, name: "G Block", type: "Block", description: "On the E–F–G road/row." },
  { id: 9, name: "H Block", type: "Block", description: "Beside the side road near D Block." },
  { id: 10, name: "I Block", type: "Block", description: "Reached by turning toward I Block from the E–F–G route." },
  { id: 11, name: "ABJ Auditorium", type: "Facility", description: "Left at the split beyond C Block." },
  { id: 12, name: "Football Court", type: "Facility", description: "Near C Block." },
  { id: 13, name: "Botanical Park", type: "Facility", description: "Straight from the H/D side road." },
  { id: 14, name: "Sports Block", type: "Facility", description: "Beside Botanical Park." },
  { id: 15, name: "Maker Lab", type: "Facility", description: "Opposite H Block." },
  { id: 16, name: "Fruit Juice Shop", type: "Facility", description: "Opposite H Block." },
  { id: 17, name: "Parking", type: "Facility", description: "Near ABJ Auditorium and H Block." }
];

function App() {
  const [locations, setLocations] = useState(fallbackLocations);
  const [from, setFrom] = useState("Main Entrance");
  const [to, setTo] = useState("I Block");
  const [route, setRoute] = useState([]);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", type: "Block", description: "" });

  const loadLocations = async () => {
    try {
      const res = await fetch(`${API}/locations`);
      if (!res.ok) throw new Error();
      setLocations(await res.json());
      setMessage("Connected to Spring Boot backend.");
    } catch {
      setMessage("Backend is not running. Showing demo campus data.");
    }
  };

  useEffect(() => { loadLocations(); }, []);

  const findRoute = async () => {
    if (from === to) {
      setRoute([from]);
      return;
    }
    try {
      const res = await fetch(`${API}/routes?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRoute(data);
    } catch {
      // Frontend demo fallback using known campus relationships.
      const graph = {
        "Main Entrance": ["A Block"],
        "A Block": ["Main Entrance", "B Block", "E Block"],
        "B Block": ["A Block", "C Block"],
        "C Block": ["B Block", "Football Court", "ABJ Auditorium", "D Block"],
        "D Block": ["C Block", "H Block"],
        "H Block": ["D Block", "Botanical Park", "Maker Lab", "Fruit Juice Shop", "Parking"],
        "Botanical Park": ["H Block", "Sports Block"],
        "Sports Block": ["Botanical Park", "E Block", "F Block", "G Block"],
        "E Block": ["Sports Block", "F Block", "I Block"],
        "F Block": ["E Block", "G Block"],
        "G Block": ["F Block", "I Block"],
        "I Block": ["E Block", "G Block"],
        "ABJ Auditorium": ["C Block", "Parking"],
        "Football Court": ["C Block"],
        "Maker Lab": ["H Block"],
        "Fruit Juice Shop": ["H Block"],
        "Parking": ["H Block", "ABJ Auditorium"]
      };
      const queue = [[from]];
      const visited = new Set([from]);
      while (queue.length) {
        const path = queue.shift();
        const current = path[path.length - 1];
        if (current === to) {
          setRoute(path);
          return;
        }
        for (const next of (graph[current] || [])) {
          if (!visited.has(next)) {
            visited.add(next);
            queue.push([...path, next]);
          }
        }
      }
      setRoute([]);
    }
  };

  const instructionMap = {
    "Main Entrance->A Block": "From the main entrance, go straight ahead to A Block.",
    "A Block->Main Entrance": "From A Block, go straight back toward the main entrance.",
    "A Block->B Block": "From A Block, take the left route and continue straight toward B Block.",
    "B Block->A Block": "From B Block, follow the road back toward A Block.",
    "A Block->E Block": "From A Block, follow the road on the north side toward the E–F–G row.",
    "E Block->A Block": "From the E–F–G row, follow the road back toward A Block.",
    "E Block->F Block": "Continue along the E–F–G road to F Block.",
    "F Block->E Block": "Follow the same E–F–G road back toward E Block.",
    "F Block->G Block": "Continue along the same E–F–G road to G Block.",
    "G Block->F Block": "Follow the E–F–G road back toward F Block.",
    "E Block->I Block": "Continue along the E–F–G route, then turn left toward I Block.",
    "I Block->E Block": "From I Block, follow the road back toward the E–F–G route.",
    "G Block->I Block": "Continue along the E–F–G route and turn toward I Block.",
    "I Block->G Block": "From I Block, follow the road back toward the E–F–G route and G Block.",
    "B Block->C Block": "From B Block, turn left and continue toward C Block.",
    "C Block->B Block": "From C Block, follow the road back toward B Block.",
    "C Block->Football Court": "Near C Block, continue to the football court/ground.",
    "Football Court->C Block": "From the football court, return toward C Block.",
    "C Block->ABJ Auditorium": "From B Block, continue straight beyond C Block to the split; take the left side toward ABJ Auditorium.",
    "ABJ Auditorium->C Block": "From ABJ Auditorium, follow the road back toward the split near C Block.",
    "C Block->D Block": "From B Block, continue straight beyond C Block to the split; take the right side toward D Block.",
    "D Block->C Block": "From D Block, follow the side route back toward the split near C Block.",
    "D Block->H Block": "From D Block, take the side road/galli beside D Block toward H Block.",
    "H Block->D Block": "From H Block, follow the side road/galli back toward D Block.",
    "H Block->Botanical Park": "From the galli between H and D, go back/straight toward Botanical Park.",
    "Botanical Park->H Block": "From Botanical Park, follow the route back toward the H/D side road.",
    "Botanical Park->Sports Block": "Sports Block is beside Botanical Park; continue along that route to Sports Block.",
    "Sports Block->Botanical Park": "From Sports Block, follow the route back toward Botanical Park.",
    "Sports Block->E Block": "Continue from Sports Block along the route and turn right toward the E–F–G road.",
    "E Block->Sports Block": "From the E–F–G road, follow the route back toward Sports Block.",
    "H Block->Maker Lab": "The Maker Lab is opposite H Block; cross/follow the road to the Maker Lab side.",
    "Maker Lab->H Block": "From the Maker Lab, follow the road back toward H Block.",
    "H Block->Fruit Juice Shop": "The fruit juice shop is opposite H Block; follow the road to the shop side.",
    "Fruit Juice Shop->H Block": "From the fruit juice shop, follow the road back toward H Block.",
    "H Block->Parking": "Parking is near the H Block side; follow the road to the parking area.",
    "Parking->H Block": "From parking, follow the road back toward H Block.",
    "ABJ Auditorium->Parking": "Parking is beside the auditorium; follow the road beside ABJ Auditorium to parking.",
    "Parking->ABJ Auditorium": "From parking, follow the road back toward ABJ Auditorium."
  };

  const getInstruction = (current, next) =>
    instructionMap[`${current}->${next}`] || `Continue from ${current} toward ${next}.`;

  const saveLocation = async (e) => {
    e.preventDefault();
    try {
      const url = editing ? `${API}/locations/${editing.id}` : `${API}/locations`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
      await loadLocations();
      setEditing(null);
      setForm({ name: "", type: "Block", description: "" });
    } catch {
      setMessage("Start the Spring Boot backend to use database CRUD.");
    }
  };

  const deleteLocation = async (id) => {
    try {
      const res = await fetch(`${API}/locations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await loadLocations();
    } catch {
      setMessage("Start the Spring Boot backend to use database CRUD.");
    }
  };

  return (
    <div className="app">
      <header>
        <div>
          <div className="brand">AU</div>
        </div>
        <div>
          <h1>Smart Campus</h1>
          <p>Anurag University • Map & Navigation</p>
        </div>
        <nav>
          <a href="#navigate">Navigate</a>
          <a href="#locations">Locations</a>
          <a href="#crud">Manage</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div>
            <span className="eyebrow">ANURAG UNIVERSITY • HYDERABAD</span>
            <h2>Find your way around campus.</h2>
            <p>Choose where you are and where you want to go. Get a simple route through the campus.</p>
            <a className="button" href="#navigate">Start Navigation ↓</a>
          </div>
          <div className="hero-card">
            <strong>Campus Navigation</strong>
            <p>Main Entrance → A Block → campus routes</p>
            <div className="route-line"></div>
            <p>Blocks, auditorium, sports & facilities</p>
          </div>
        </section>

        <section id="navigate" className="panel">
          <span className="eyebrow">01 • NAVIGATION</span>
          <h3>Where do you want to go?</h3>
          <div className="selectors">
            <label>From
              <select value={from} onChange={e => setFrom(e.target.value)}>
                {locations.map(l => <option key={l.id ?? l.name}>{l.name}</option>)}
              </select>
            </label>
            <label>To
              <select value={to} onChange={e => setTo(e.target.value)}>
                {locations.map(l => <option key={l.id ?? l.name}>{l.name}</option>)}
              </select>
            </label>
            <button className="button" onClick={findRoute}>Find Route</button>
          </div>

          {route.length > 0 && (
            <div className="route-result">
              <h4>Route</h4>
              {route.map((step, i) => (
                <div className="step" key={`${step}-${i}`}>
                  <span>{i + 1}</span>
                  <div>
                    <b>{step}</b>
                    {i < route.length - 1 && <small>{getInstruction(step, route[i + 1])}</small>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="locations" className="panel">
          <span className="eyebrow">02 • CAMPUS</span>
          <h3>Campus locations</h3>
          <div className="cards">
            {locations.map(l => (
              <article className="card" key={l.id ?? l.name}>
                <span>{l.type}</span>
                <h4>{l.name}</h4>
                <p>{l.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="crud" className="panel crud">
          <span className="eyebrow">03 • CRUD</span>
          <h3>Manage campus locations</h3>
          <p className="muted">This section demonstrates Create, Read, Update and Delete operations through the Spring Boot API.</p>

          <form onSubmit={saveLocation}>
            <input placeholder="Location name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
            <select value={form.type} onChange={e => setForm({...form, type:e.target.value})}>
              <option>Block</option><option>Facility</option><option>Entrance</option>
            </select>
            <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description:e.target.value})} />
            <button className="button" type="submit">{editing ? "Update" : "Add"} Location</button>
            {editing && <button type="button" onClick={() => {setEditing(null); setForm({name:"",type:"Block",description:""});}}>Cancel</button>}
          </form>

          <div className="admin-list">
            {locations.map(l => (
              <div className="admin-row" key={l.id ?? l.name}>
                <span><b>{l.name}</b> — {l.type}</span>
                {l.id && <div>
                  <button onClick={() => {setEditing(l); setForm({name:l.name,type:l.type,description:l.description});}}>Edit</button>
                  <button onClick={() => deleteLocation(l.id)}>Delete</button>
                </div>}
              </div>
            ))}
          </div>
          <p className="status">{message}</p>
        </section>
      </main>
      <footer>Smart Campus – Map & Navigation System • Java Full Stack Project</footer>
    </div>
  );
}

export default App;
