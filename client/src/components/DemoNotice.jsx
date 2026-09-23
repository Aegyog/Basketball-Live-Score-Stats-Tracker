import { USING_MOCK_API } from '../api'

export default function DemoNotice() {
  if (!USING_MOCK_API) return null
  return <div className="demo-notice" role="status"><strong>Week 1 demo mode.</strong> Games are saved only in this browser while the Express and PostgreSQL service is being built.</div>
}
