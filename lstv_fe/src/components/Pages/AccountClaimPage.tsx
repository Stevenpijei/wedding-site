import queryString from 'query-string'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Flex from '../Utility/Flex'
import SignUpForm from '/components/Pages/forms/SignUpForm'
import SingleSectionLayout from '/components/Pages/layouts/SingleSectionLayout'
import PageVeil from '/components/Utility/PageVeil'
import { useAuthService } from '/rest-api/hooks/useAuthService'

// TODO: eventually we'll use the full and proper types
// we'll move from the admin repo into a namespaced @lstv/core package.
interface Business {
  name: string,
  slug: string,
}

interface FormData {
  first_name: string,
  last_name: string,
  email: string,
  password: string
}

const AccountClaimPage = () => {
  const { search } = useLocation()
  const { errorMessages, signUpAndClaimBusiness, verifyAccountClaim } = useAuthService();

  const [loaded, setLoaded] = useState(false)
  const [code, setCode] = useState<string>()
  const [business, setBusiness] = useState<Business>()
  const [valid, setValid] = useState(false)

  useEffect(() => {
    const { code } = queryString.parse(search)
    if(code) {
      if(Array.isArray(code)) setCode(code[0])
      else setCode(code)
    }
  }, [search])

  useEffect(() => {
    if(!code) return

    (async () => {
      try {
        const resp = await verifyAccountClaim(code)
        const { business_name: name, business_slug: slug } = resp
        setBusiness({ name, slug })
        setValid(true)
      } catch(e) {
        //
      }
      setLoaded(true)
    })()
  }, [code])

  const onSubmit = async (formData: FormData)  => {
    const claimData = {
      ...formData,
      code
    }
    // returned so errors get sent to the submit handler in SignUpForm
    return await signUpAndClaimBusiness(business.slug, claimData)
  }

  return (
    <SingleSectionLayout style={{ padding: '28px 0 100px' }}>
      {/* Too much? */}
      <PageVeil isLoading onUnveilCheck={() => loaded} />

      { valid ?
        <div>
          <h1 style={{ margin: '0 28px' }}>
            Claim ownership of { business.name }
          </h1>
          <Flex justify='center'>
            <SignUpForm
              isBusiness
              onSubmit={onSubmit}
              responseErrors={errorMessages?.response_errors}
              style={{ margin: '0 -28px' }}
            />
          </Flex>
        </div> :
        <p>Invalid, non-existent or expired claim code</p>
      }
    </SingleSectionLayout>
  )
}

export default AccountClaimPage