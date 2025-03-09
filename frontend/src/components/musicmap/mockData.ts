// Mock data for the music map visualization
// In a real application, this would be replaced with API calls to a music service like Spotify or Last.fm

interface Node {
  id: string;
  name: string;
  group: number;
  size: number;
  isCenter?: boolean;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

// Mock artist database with predefined relationships
const artistDatabase: Record<string, string[]> = {
  'radiohead': [
    'Thom Yorke', 'Arcade Fire', 'Sigur Ros', 'Modest Mouse', 'The National',
    'Portishead', 'Björk', 'Massive Attack', 'Bon Iver', 'Alt-J'
  ],
  'thom yorke': [
    'Radiohead', 'Atoms For Peace', 'Four Tet', 'James Blake', 'Flying Lotus',
    'Burial', 'Aphex Twin', 'Björk', 'Flea', 'Nigel Godrich'
  ],
  'arcade fire': [
    'Radiohead', 'The National', 'Broken Social Scene', 'Modest Mouse', 'Bon Iver',
    'LCD Soundsystem', 'Neutral Milk Hotel', 'Sufjan Stevens', 'Vampire Weekend', 'Fleet Foxes'
  ],
  'daft punk': [
    'Justice', 'The Chemical Brothers', 'Deadmau5', 'Air', 'Kavinsky',
    'LCD Soundsystem', 'Gorillaz', 'Aphex Twin', 'Boards of Canada', 'The Prodigy'
  ],
  'the beatles': [
    'The Rolling Stones', 'Led Zeppelin', 'Pink Floyd', 'The Who', 'The Beach Boys',
    'The Kinks', 'Queen', 'Bob Dylan', 'David Bowie', 'Elton John'
  ],
  'kanye west': [
    'Jay-Z', 'Kendrick Lamar', 'Drake', 'Kid Cudi', 'Frank Ocean',
    'Tyler, The Creator', 'A$AP Rocky', 'J. Cole', 'Travis Scott', 'Pusha T'
  ],
  'taylor swift': [
    'Katy Perry', 'Lady Gaga', 'Ariana Grande', 'Lorde', 'Lana Del Rey',
    'Selena Gomez', 'Ed Sheeran', 'Adele', 'Billie Eilish', 'Olivia Rodrigo'
  ],
  'beyoncé': [
    'Rihanna', 'Alicia Keys', 'Adele', 'Ariana Grande', 'Lady Gaga',
    'Mariah Carey', 'Kendrick Lamar', 'Frank Ocean', 'Janelle Monáe', 'SZA'
  ],
  // Default set of artists for any search not in our database
  'default': [
    'Radiohead', 'The Beatles', 'Daft Punk', 'Kanye West', 'Taylor Swift',
    'Beyoncé', 'Bob Dylan', 'David Bowie', 'Queen', 'Fleetwood Mac'
  ]
};

// Generate a mock graph data structure for a given artist
export const getMockArtistData = (artistName: string): GraphData => {
  const normalizedName = artistName.toLowerCase().trim();
  
  // Get related artists (either from our database or default)
  const relatedArtists = artistDatabase[normalizedName] || 
                         artistDatabase['default'];
  
  // Create graph nodes
  const nodes: Node[] = [
    {
      id: normalizedName,
      name: artistName, // Use the original casing
      group: 0,
      size: 10,
      isCenter: true
    },
    ...relatedArtists.map((artist, index) => ({
      id: artist.toLowerCase(),
      name: artist,
      group: Math.floor(index / 2) + 1,
      size: 5 - (index * 0.3)
    }))
  ];
  
  // Generate some second-tier relationships
  const secondaryArtists: Record<string, string[]> = {};
  relatedArtists.forEach((artist, index) => {
    if (index < 3) { // Only do this for the first few artists to keep it simple
      const lowercaseArtist = artist.toLowerCase();
      if (artistDatabase[lowercaseArtist]) {
        secondaryArtists[lowercaseArtist] = artistDatabase[lowercaseArtist]
          .filter(a => a.toLowerCase() !== normalizedName && 
                      !relatedArtists.map(x => x.toLowerCase()).includes(a.toLowerCase()))
          .slice(0, 3); // Just take a few to keep visualization clean
          
        // Add these to nodes
        secondaryArtists[lowercaseArtist].forEach(secondary => {
          if (!nodes.some(n => n.id === secondary.toLowerCase())) {
            nodes.push({
              id: secondary.toLowerCase(),
              name: secondary,
              group: Math.floor(Math.random() * 3) + 3,
              size: 2
            });
          }
        });
      }
    }
  });
  
  // Create links between artists
  const links: Link[] = [
    // Links from center artist to all direct connections
    ...relatedArtists.map((artist, index) => ({
      source: normalizedName,
      target: artist.toLowerCase(),
      value: 1 - (index * 0.08) // Decreasing similarity as index increases
    })),
    
    // Add some connections between related artists
    ...relatedArtists.flatMap((artist, i) => 
      i < relatedArtists.length - 1 
        ? [{
            source: artist.toLowerCase(),
            target: relatedArtists[i + 1].toLowerCase(),
            value: 0.3 + Math.random() * 0.3
          }] 
        : []
    ),
    
    // Add links to secondary artists
    ...Object.entries(secondaryArtists).flatMap(([artist, secondaries]) => 
      secondaries.map(secondary => ({
        source: artist,
        target: secondary.toLowerCase(),
        value: 0.2 + Math.random() * 0.2
      }))
    )
  ];
  
  return { nodes, links };
};
