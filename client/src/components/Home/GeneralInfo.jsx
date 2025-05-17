import React from 'react';
import './styles/GeneralInfo.css';

const GeneralInformation = ({ languageType = 'en' }) => {
  const content = {
    en: {
      title: "General Information",
      warning: "The application gets completed after verification. After 1 month the application gets cancelled and the user will be required to register themselves again.",
      penaltyHeading: "Penalty:",
      penaltyList: [
        "The user will be eligible for the penalty if any complaint has been registered against them by any manual mode.",
        "Once the financial year ends, the user will be required to renew their pet registration.",
        "After the expiration of the certificate, if the pet is found without valid registration, additional penalties may apply.",
        "Violation of rules regarding the registration and breeding of aggressive dog breeds (Pitbull, Rottweiler, Dogo Argentino) is punishable by a fine of ₹5000 per dog.",
        "Violation of rules and conditions for pet shops is subject to a penalty of ₹5000.",
        "For license renewal, if the application is submitted between May 1st and May 31st, a late fee of ₹100 is required.",
        "If the renewal application is submitted on or after June 1st, a fine of ₹50 per day will be imposed, in addition to the license fee and the late fee.",
        "Not obtaining a license from the Gorakhpur Municipal Corporation for keeping aggressive breeds like American Pitbull, Rottweiler, Siberian Husky, Doberman Pinscher, and Boxer, or any other dangerous pet, will result in a fine of ₹5000 per animal.",
        "If a pet owner notices symptoms of diseases like Rabies in their pet (e.g., excessive salivation, biting tendency) and fails to immediately inform the Gorakhpur Municipal Corporation, and an unpleasant incident occurs as a result, the pet owner will face a ₹5000 fine along with legal action.",
        "It is mandatory for dog owners to chain their dog before taking it outside the house and to use a muzzle."
      ]
    },
    hi: {
      title: "सामान्य जानकारी",
      warning: "सत्यापन के बाद आवेदन पूरा हो जाता है। 1 महीने के बाद आवेदन रद्द हो जाता है और उपयोगकर्ता को खुद को फिर से पंजीकृत करना होगा।", // This part wasn't in the PDF, providing a likely translation
      penaltyHeading: "जुर्माना:",
      penaltyList: [
        "यदि किसी भी मैन्युअल माध्यम से उनके खिलाफ कोई शिकायत दर्ज की गई है, तो उपयोगकर्ता जुर्माने के लिए पात्र होगा।", // Translation based on English point
        "वित्तीय वर्ष समाप्त होने के बाद, उपयोगकर्ता को अपने पालतू जानवर का पंजीकरण नवीनीकृत करना होगा।", // Translation based on English point
        "प्रमाण पत्र की समाप्ति के बाद, यदि पालतू जानवर बिना वैध पंजीकरण के पाया जाता है, तो अतिरिक्त जुर्माना लग सकता है।", // Translation based on English point
        "आक्रामक श्वानों (पीटबुल, रॉट वीलर, डोगो अर्जेन्टीनों) के पंजीकरण तथा ब्रीडिंग (Breeding) के नियमों की अवहेलना पर प्रति श्वान 5000/- रूपये अर्थदण्ड लगाया जायेगा।",
        "पेट शाप/दुकानों हेतु उक्त नियमों की अवहेलना पर अंकन 5000-00 रूपये अर्थदण्ड के रूप में लगाया जायेगा।",
        "अनुज्ञा का नवीनीकरण हेतु यदि आवेदन पत्र 01 मई के उपरान्त किन्तु 31 मई के पूर्व प्रस्तुत किया जाता है तो निर्धारित विलम्ब शुल्क रु०- 100.00 जमा करना आवश्यक होगा।",
        "यदि 01 जून अथवा उसके पश्चात आवेदन पत्र प्रस्तुत किया जाता है तो उस स्थिति में अनुज्ञा शुल्क विलम्ब शुल्क के साथ अनुसूची में निर्धारित जुर्माना रु 50.00 प्रतिदिन की दर से जुर्माना करने के उपरान्त ही अनुज्ञा का नवीनीकरण किया जा सकेगा।",
        "अगर अमेरिकन पिटबुल, सेंटविलर, सिवोरियन, हुसकी, डाबरमैन पिन्सचर तथा वाक्सर बीड के कुत्ते एवं ऐसे खतरनाक पालतू पशुओं को पालने के लिए गोरखपुर नगर निगम से लाइसेंस नहीं लिया गया है तो रू0 5000/- पशु की दर से जुर्माना वसूला जायेगा।",
        "यदि किसी पालतू पशु स्वामी को अपने पालतू पशु में रैबीज व अन्य बीमारी के लक्षण नजर आये और तत्काल इसकी सूचना नगर निगम, गोरखपुर को न दें जिससे किसी भी प्रकार की अप्रिय घटना घटित न हो, अन्यथा की स्थिति में कोई अप्रिय घटना घटित होता है तो उस पालतू पशु स्वामी पर रू0 5000.00 जुर्माने के साथ विधिक कार्यवाही की जायेगी।",
        "श्वान/कुत्ते के स्वामी द्वारा अपने श्वान/कुत्ते को घर से बाहर निकालने से पहले श्वान/कुत्ते को चौन से बाधना अनिवार्य होगा एवं श्वान / कुत्ते के सम्बन्ध में मुंह पर मजल लगायी जानी आवश्यक होगी।"
      ]
    }
  };

  const currentContent = content[languageType] || content.en; // Default to English if languageType is not 'en' or 'hi'

  return (
    <section className="gov-portal-info-module">
      <div className="gov-portal-info-container">
        <h1 className="gov-portal-info-title">{currentContent.title}</h1>

        <div className="info-card-wrapper">
          <div className="gov-portal-info-card">
            {currentContent.warning && ( // Render warning only if it exists for the language
              <p className="moving-warning" aria-live="polite">
                {currentContent.warning}
              </p>
            )}
            <h3 className="penalty-heading">{currentContent.penaltyHeading}</h3>
            <ul className="penalty-list">
              {currentContent.penaltyList.map((item, index) => (
                <li key={index} className="penalty-list-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GeneralInformation;