'use client'

import { FormEvent, useEffect, useId, useRef, useState } from 'react'

import './inquiry-modal.css'

type InquiryKind = 'partner' | 'sponsor'

type InquiryModalProps = {
  kind: InquiryKind
  initialCategory?: string
  onClose: () => void
  options: readonly string[]
}

export function InquiryModal({
  initialCategory,
  kind,
  onClose,
  options,
}: InquiryModalProps) {
  const titleId = useId()
  const firstField = useRef<HTMLInputElement>(null)
  const openedAt = useRef(Date.now())
  const requestId = useRef<string | null>(null)
  const submitting = useRef(false)
  const [category, setCategory] = useState(initialCategory ?? options[0] ?? '')
  const [status, setStatus] = useState<'form' | 'sending' | 'success'>('form')
  const [error, setError] = useState('')
  const [canSubmit, setCanSubmit] = useState(false)

  useEffect(() => {
    const scrollY = window.scrollY
    const root = document.documentElement
    const body = document.body
    const previous = {
      bodyLeft: body.style.left,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyRight: body.style.right,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      rootOverflow: root.style.overflow,
    }

    root.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    firstField.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      root.style.overflow = previous.rootOverflow
      body.style.overflow = previous.bodyOverflow
      body.style.position = previous.bodyPosition
      body.style.top = previous.bodyTop
      body.style.left = previous.bodyLeft
      body.style.right = previous.bodyRight
      body.style.width = previous.bodyWidth
      window.scrollTo(0, scrollY)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true

    const form = new FormData(event.currentTarget)
    setError('')
    setStatus('sending')

    try {
      requestId.current ??= window.crypto.randomUUID()
      const response = await fetch('/api/inquiries', {
        body: JSON.stringify({
          category,
          companyFax: String(form.get('companyFax') ?? ''),
          email: String(form.get('email') ?? ''),
          kind,
          message: String(form.get('message') ?? ''),
          name: String(form.get('name') ?? ''),
          openedAt: openedAt.current,
          organization: String(form.get('organization') ?? ''),
          requestId: requestId.current,
          website: String(form.get('website') ?? ''),
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(payload?.error || 'Request could not be sent')
      }
      setStatus('success')
    } catch (requestError) {
      submitting.current = false
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not send the request. Please try again in a moment.',
      )
      setStatus('form')
    }
  }

  return (
    <div className='ab-inquiry-backdrop' onMouseDown={onClose}>
      <section
        aria-labelledby={titleId}
        aria-modal='true'
        className='ab-inquiry-modal'
        onMouseDown={(event) => event.stopPropagation()}
        role='dialog'
      >
        <button
          aria-label='Close form'
          className='ab-inquiry-close'
          onClick={onClose}
          type='button'
        >
          ×
        </button>

        {status === 'success' ? (
          <div className='ab-inquiry-success'>
            <span className='hw26-label hw26-label--mint'>Request sent</span>
            <h2 id={titleId}>
              {kind === 'partner'
                ? 'Let’s build together'
                : 'Let’s make it happen'}
            </h2>
            <p>
              Your request has been sent. Our{' '}
              {kind === 'partner' ? 'partnership' : 'sponsorship'} team will
              contact you within 24 hours.
            </p>
            <button className='hw26-apply' onClick={onClose} type='button'>
              Done
            </button>
          </div>
        ) : (
          <>
            <span className='hw26-label hw26-label--mint'>
              {kind === 'partner' ? 'Partner request' : 'Sponsor request'}
            </span>
            <h2 id={titleId}>
              {kind === 'partner' ? 'Tell us about you' : 'Start sponsorship'}
            </h2>
            <p className='ab-inquiry-intro'>
              A few details are enough. We’ll review them and get back to you
              within 24 hours.
            </p>

            <form
              className='ab-inquiry-form'
              onInput={(event) =>
                setCanSubmit(event.currentTarget.checkValidity())
              }
              onSubmit={submit}
            >
              <label aria-hidden='true' className='ab-inquiry-trap'>
                <span>Company fax</span>
                <input autoComplete='off' name='companyFax' tabIndex={-1} />
              </label>
              {error ? (
                <p aria-live='polite' className='ab-inquiry-error'>
                  {error}
                </p>
              ) : null}
              <label>
                <span>Name</span>
                <input
                  autoComplete='name'
                  name='name'
                  placeholder='Your name'
                  ref={firstField}
                  required
                />
              </label>

              <label>
                <span>Work email</span>
                <input
                  autoComplete='email'
                  name='email'
                  placeholder='you@company.com'
                  required
                  type='email'
                />
              </label>

              <label>
                <span>Organization</span>
                <input
                  autoComplete='organization'
                  name='organization'
                  placeholder='Company or community'
                  required
                />
              </label>

              <label>
                <span>Website</span>
                <input
                  autoComplete='url'
                  inputMode='url'
                  name='website'
                  placeholder='chronotap.co'
                  type='text'
                />
              </label>

              <label className='ab-inquiry-wide'>
                <span>{kind === 'partner' ? 'Partnership type' : 'Package'}</span>
                <select
                  name='category'
                  onChange={(event) => setCategory(event.target.value)}
                  value={category}
                >
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className='ab-inquiry-wide'>
                <span>Tell us more</span>
                <textarea
                  name='message'
                  placeholder={
                    kind === 'partner'
                      ? 'What can we build or offer together?'
                      : 'What would you like to achieve at Alien Bazaar?'
                  }
                  required
                  rows={4}
                />
              </label>

              <button
                className='hw26-apply ab-inquiry-submit'
                disabled={status === 'sending' || !canSubmit}
                type='submit'
              >
                {status === 'sending' ? 'Sending…' : 'Send request'}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
