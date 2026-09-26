import { USING_MOCK_API } from '../api'

export default function DemoNotice() {
  if (!USING_MOCK_API) return null
  return <div className="demo-notice" role="status"><strong>Demo mode.</strong> Games are saved only in this browser. Set <code>VITE_USE_MOCK_API=false</code> to use the Week 2 Express and PostgreSQL service.</div>
}
