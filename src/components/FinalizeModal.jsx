import { QRCodeSVG } from 'qrcode.react'
import { getFlyerDownloadUrl, getFlyerPublicUrl } from '../gameApi.js'

export default function FinalizeModal({ payload, graphics, requestState, requestMessage, onRetry, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal finalize-modal" role="dialog" aria-modal="true" aria-labelledby="finalize-title">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">GAME COMPLETE</span>
            <h2 id="finalize-title">Final box score</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close final score">×</button>
        </div>
        <div className={`request-status status-${requestState}`} role="status">
          <span className="status-indicator" />
          <div>
            <strong>{requestState === 'sending' ? 'Sending game data' : requestState === 'success' ? 'Game sent successfully' : 'Could not reach backend'}</strong>
            <p>{requestMessage}</p>
          </div>
          {requestState === 'error' && <button type="button" className="retry-button" onClick={onRetry}>Retry</button>}
        </div>
        <div className="payload-heading">
          <span>API PAYLOAD</span>
          <code>POST /api/games/finalize</code>
        </div>
        <pre className="payload-code">{JSON.stringify(payload, null, 2)}</pre>
        {graphics.length > 0 && (
          <section className="generated-flyers" aria-label="Generated flyers">
            <h3>Generated flyers</h3>
            <div className="generated-flyer-list">
              {graphics.map((graphic, index) => {
                const publicUrl = getFlyerPublicUrl(graphic)
                const downloadUrl = getFlyerDownloadUrl(graphic)
                const flyerName = graphic.playerName || `Flyer ${index + 1}`

                return (
                  <article className="generated-flyer-card" key={`${publicUrl}-${index}`}>
                    <a href={publicUrl} target="_blank" rel="noreferrer">
                      <img src={publicUrl} alt={`Generated flyer for ${flyerName}`} />
                      <span>Open {flyerName}</span>
                    </a>
                    {downloadUrl ? (
                      <>
                        <div className="flyer-qr">
                          <QRCodeSVG
                            value={downloadUrl}
                            size={132}
                            level="M"
                            marginSize={4}
                            role="img"
                            aria-label={`QR code to download flyer for ${flyerName}`}
                          />
                        </div>
                        <a className="flyer-download-link" href={downloadUrl} target="_blank" rel="noreferrer">
                          Download {flyerName}
                        </a>
                      </>
                    ) : (
                      <p className="flyer-qr-unavailable" role="status">
                        A QR code is unavailable because the server did not return a valid flyer URL.
                      </p>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        )}
        <div className="modal-footer">
          <span>Ready for your ScoreKings backend.</span>
          <button type="button" className="primary-button" onClick={onClose}>Done <span>✓</span></button>
        </div>
      </section>
    </div>
  )
}
