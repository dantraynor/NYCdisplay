# NYC Subway Live Frontend

This is the frontend application for the NYC Subway Live project. It provides a real-time visualization of NYC subway data, including train positions, active trips, and service alerts.

## Features

- Interactive map showing real-time train positions
- List of active trips with detailed information
- Service alerts and updates
- Real-time data updates
- Responsive design for all screen sizes

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- React Query
- Leaflet Maps
- Axios

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory with the following content:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── public/          # Static files
├── src/
│   ├── components/  # React components
│   ├── lib/         # Utilities and API client
│   ├── pages/       # Next.js pages
│   ├── styles/      # Global styles
│   └── types/       # TypeScript type definitions
└── ...
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT 