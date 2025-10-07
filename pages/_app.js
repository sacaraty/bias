import '../styles/tailwind.css';
import 'tippy.js/dist/tippy.css';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
