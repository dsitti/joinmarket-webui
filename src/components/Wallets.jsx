import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as rb from 'react-bootstrap'
import Alert from './Alert'
import Wallet from './Wallet'
import PageTitle from './PageTitle'
import { useCurrentWallet } from '../context/WalletContext'
import { useTranslation } from 'react-i18next'
import { walletDisplayName } from '../utils'
import * as Api from '../libs/JmWalletApi'

export default function Wallets({ startWallet, stopWallet }) {
  const { t } = useTranslation()
  const currentWallet = useCurrentWallet()
  const [walletList, setWalletList] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState(
    currentWallet?.name && {
      variant: 'info',
      message: t('wallets.alert_wallet_open', { currentWalletName: walletDisplayName(currentWallet.name) }),
      dismissible: true,
    }
  )

  const walletsFailedError = t('wallets.error_loading_failed')

  useEffect(() => {
    const abortCtrl = new AbortController()

    setIsLoading(true)
    Api.getWalletAll({ signal: abortCtrl.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.message || walletsFailedError))))
      .then((data) => {
        const { wallets = [] } = data
        if (currentWallet) {
          wallets.sort((a, b) => b === currentWallet.name)
        }
        setWalletList(wallets)
      })
      .catch((err) => {
        if (!abortCtrl.signal.aborted) {
          setAlert({ variant: 'danger', message: err.message })
        }
      })
      .finally(() => {
        if (!abortCtrl.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => abortCtrl.abort()
  }, [currentWallet, walletsFailedError])

  return (
    <div className="wallets">
      <PageTitle
        title={t('wallets.title')}
        subtitle={walletList?.length === 0 ? t('wallets.subtitle_no_wallets') : null}
        center={true}
      />
      {alert && <Alert {...alert} />}
      {isLoading && (
        <div className="d-flex justify-content-center align-items-center">
          <rb.Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
          <span>{t('wallets.text_loading')}</span>
        </div>
      )}
      {walletList?.map((wallet, index) => (
        <Wallet
          key={wallet}
          name={wallet}
          currentWallet={currentWallet}
          startWallet={startWallet}
          stopWallet={stopWallet}
          setAlert={setAlert}
          className={`bg-transparent rounded-0 border-start-0 border-end-0 ${
            index === 0 ? 'border-top-1' : 'border-top-0'
          }`}
        />
      ))}
      <div className="d-flex justify-content-center">
        <Link
          to="/create-wallet"
          className={`btn mt-4 ${walletList?.length === 0 ? 'btn-lg btn-dark' : 'btn-outline-dark'}`}
        >
          {t('wallets.button_new_wallet')}
        </Link>
      </div>
    </div>
  )
}
