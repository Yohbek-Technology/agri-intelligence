import 'dotenv/config'
import dns from 'node:dns'

try {
  dns.setDefaultResultOrder('ipv4first')
} catch {
  // node < 16
}
