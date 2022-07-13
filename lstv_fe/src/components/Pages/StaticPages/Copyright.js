import React from 'react';
import Text from './commonComponents/Text';
import Title from './commonComponents/Title';
import StaticPageLayout from './StaticPageLayout';
import LSTVLink from '../../Utility/LSTVLink'

const Copyright = ({}) => {
    return (
        <StaticPageLayout headerText="DMCA Copyright Policy">
            <Title>Love Stories TV, Inc. DMCA COPYRIGHT POLICY</Title>

            <Text>
                Love Stories TV, Inc. (“Company”) has adopted the following general policy toward copyright infringement
                in accordance with the Digital Millennium Copyright Act of 1998, 17 U.S.C. § 512 (“DMCA”)
                (<LSTVLink to="https://lcweb.loc.gov/copyright/legislation/dmca.pdf" >https://lcweb.loc.gov/copyright/legislation/dmca.pdf</LSTVLink>). Company takes claims of copyright infringement
                seriously. As outlined in Company’s Terms of Service, each user is responsible for ensuring that the
                content they upload to Company’s website and services (the “Services”) does not infringe any third
                party’s copyright. If Company believes that a user’s conduct has violated Company’s Terms of Service or
                if Company receives a valid notification from a third party (as set forth below) that any of a user’s
                content infringers the copyright or other rights of that third party, the user will receive a warning
                and any allegedly infringing content uploaded by the user will be removed or access to it will be
                disabled. In appropriate circumstances, such as if a user receives two or more warnings, the user’s
                access to the Services will be terminated. Company reserves the right to terminate a user’s account if
                the user account has received fewer than two warnings. If a user believes that his or her content was
                removed or access to it was disabled in error, or that his or her content was misidentified, the user
                may submit a counter-notification, as described below. Company reserves the right to remove and/or
                disable access to content, decline to restore content and/or access to it, or suspend and/or terminate a
                user’s account if we have a good-faith belief that the user’s content violates the Company’s Terms of
                Service. For the Company’s termination policy, see the Company’s Terms of Service
                [<LSTVLink to="https://lovestoriestv.com/terms-of-use" >https://lovestoriestv.com/terms-of-use</LSTVLink>].
            </Text>

            <Text>
                The contact information of the Designated Agent to Receive Notification of Claimed Infringement
                (“Designated Agent”) is listed below and is also registered with the U.S. Copyright Office.
            </Text>

            <Title>Procedure for Reporting Copyright Infringement:</Title>

            <Text>
                If you believe that material or content residing on or accessible through the Services infringes your
                copyright, you may request that such material or content be removed from the Services by submitting a
                written notification (a “Takedown Notice”) to our Designated Agent (listed below) in accordance with the
                DMCA. The DMCA Takedown Notice must contain substantially the following information:
            </Text>

            <Text>
                {' '}
                A physical or electronic signature of a person authorized to act on behalf of the owner of the copyright
                that has been allegedly infringed;
            </Text>
            <Text> Identification of works or materials alleged to have been infringed;</Text>
            <Text>
                {' '}
                Identification of the material that is claimed to be infringing including information regarding the
                location of the infringing materials that the copyright owner seeks to have removed, with sufficient
                detail so that Company is capable of finding and verifying its existence;
            </Text>
            <Text>
                {' '}
                Contact information of the notifier including address, telephone number and, if available, e-mail
                address;
            </Text>
            <Text>
                {' '}
                A statement that the notifier has a good faith belief that the material is not authorized by the
                copyright owner, its agent, or the law; and
            </Text>
            <Text>
                {' '}
                A statement made under penalty of perjury that the information provided is accurate and the notifying
                party is authorized to make the complaint on behalf of the copyright owner.
            </Text>

            <Text>
                Please submit your DMCA Takedown Notice to the Designated Agent to Receive Notification of Claimed
                Infringement for Company at
            </Text>

            <Title>LSTVlegal@lovestoriestv.com</Title>

            <Text>
                If your DMCA Takedown Notice fails to comply with all of the requirements set forth in Section 512(c)(3)
                of the DMCA, your DMCA Takedown Notice may not be effective.
            </Text>

            <Text>Procedure for Submitting a Counter-Notification:</Text>

            <Text>
                If you believe that content you posted or uploaded to the Services was removed or access to it was
                disabled as the result of a mistake or misidentification of content, you may file a counter-notification
                with Company (a “Counter-Notification”) in accordance with the DMCA. The Counter-Notification must
                contain substantially the following:
            </Text>

            <Text> Your physical or electronic signature;</Text>
            <Text>
                {' '}
                An identification of the material that has been removed or to which access has been disabled and the
                location at which the material appeared before it was removed or access to it was disabled;
            </Text>
            <Text>
                {' '}
                A statement under penalty of perjury that you have a good faith belief that the material was removed or
                disabled as a result of mistake or misidentification of the material to be removed or disabled; and
            </Text>
            <Text>
                {' '}
                Your name, address, and telephone number, and a statement that you consent to the jurisdiction of the
                Federal District Court for the judicial district in which your address is located, or if your address is
                outside of the United States, for any judicial district in which Company may be found, and that you will
                accept service of process from the person who submitted the Takedown Notice or an agent of such person.
            </Text>

            <Text>
                If your Counter-Notification fails to comply with all of the requirements set forth in Section 512(g)(3)
                of the DMCA, your Counter-Notification may not be effective
            </Text>

            <Text>
                Please submit your Counter-Notification to the Designated Agent to Receive Notification of Claimed
                Infringement for Company at
            </Text>

            <Title>LSTVlegal@lovestoriestv.com</Title>

            <Text>or mail to:</Text>

            <Text>Justin Boelio</Text>

            <Text>70 Remsen Street, 7B, Brooklyn, NY 11201</Text>

            <Text>917-703-2119</Text>

            <Text>
                We will send any complete Counter-Notifications we receive to the person who submitted the original DMCA
                Takedown Notice. That person may elect to file a lawsuit against you for copyright infringement. The
                DMCA allows us to restore the removed or disabled content if the party who filed the Takedown Notice
                does not file a court action against you within ten business days of receiving a copy of your
                Counter-Notification.
            </Text>

            <Text>
                In submitting any DMCA Takedown Notice or Counter-Notification, please make sure that all information
                you include is accurate. Pursuant to Section 512(f) of the DMCA, any person who knowingly materially
                misrepresents that material or activity is infringing or that material or activity was removed or
                disabled by mistake or misidentification, may be subject to liability for damages, including costs and
                attorneys’ fees.
            </Text>
        </StaticPageLayout>
    );
};

export default Copyright;
