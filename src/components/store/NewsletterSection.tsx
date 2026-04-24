import React, { useState } from 'react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock subscription
    if(email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <section className="py-24 px-4 border-t border-nephele-border bg-nephele-dim text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="greek text-3xl sm:text-4xl font-light mb-4">Join the Inner Circle</h2>
        <p className="text-sm text-nephele-grey mb-8">
          Subscribe to get early access to new drops, exclusive collections, and styling insights.
        </p>
        
        {subscribed ? (
          <div className="bg-nephele-border/50 border border-nephele-border py-4 px-6 inline-block">
            <p className="text-xs tracking-widest uppercase">Thank you for subscribing.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOUR EMAIL"
              required
              className="flex-1 bg-nephele-black border border-nephele-border px-4 py-3 text-xs tracking-wider text-nephele-white focus:outline-none focus:border-nephele-grey transition-colors placeholder:text-nephele-border"
            />
            <button
              type="submit"
              className="bg-nephele-white text-nephele-black px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-nephele-silver transition-colors"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
