export default function Java6JavaSecurityEdit() {
  return (
    <pre
      style="
        width: calc(100% - 50px);
        overflow-x: scroll;
        padding: 1em;
        font-size: 0.8em;
        background: rgba(0, 0, 0, 0.025);
        border-radius: 0.5rem;
      "
    >
      <span style="font-weight: bold;background-color: lightyellow">
        # before
      </span>
      security.provider.1=sun.security.provider.Sun
      security.provider.2=sun.security.rsa.SunRsaSign
      security.provider.3=com.sun.net.ssl.internal.ssl.Provider
      security.provider.4=com.sun.crypto.provider.SunJCE
      security.provider.5=sun.security.jgss.SunProvider
      security.provider.6=com.sun.security.sasl.Provider
      security.provider.7=org.jcp.xml.dsig.internal.dom.XMLDSigRI
      security.provider.8=sun.security.smartcardio.SunPCSC
      <span style="font-weight: bold;background-color: lightyellow">
        # after
      </span>
      <span style="color: gray"># Add provider with higher priority</span>
      <span style="color:red;font-weight: bold">
        security.provider.1=org.bouncycastle.jce.provider.BouncyCastleProvider
      </span>
      <span style="color:red;font-weight: bold">
        security.provider.2=org.bouncycastle.jsse.provider.BouncyCastleJsseProvider
      </span>
      <span style="color: gray"># Lower priority of existing providers</span>
      security.provider.<span style="color:red;font-weight: bold">3</span>
      =sun.security.provider.Sun security.provider.
      <span style="color:red;font-weight: bold">4</span>
      =sun.security.rsa.SunRsaSign security.provider.
      <span style="color:red;font-weight: bold">5</span>
      =com.sun.net.ssl.internal.ssl.Provider security.provider.
      <span style="color:red;font-weight: bold">6</span>
      =com.sun.crypto.provider.SunJCE security.provider.
      <span style="color:red;font-weight: bold">7</span>
      =sun.security.jgss.SunProvider security.provider.
      <span style="color:red;font-weight: bold">8</span>
      =com.sun.security.sasl.Provider security.provider.
      <span style="color:red;font-weight: bold">9</span>
      =org.jcp.xml.dsig.internal.dom.XMLDSigRI security.provider.
      <span style="color:red;font-weight: bold">10</span>
      =sun.security.smartcardio.SunPCSC
      <span style="color: gray">
        # Change default SocketFactory implementation
      </span>
      <span style="color:red;font-weight: bold">
        ssl.SocketFactory.provider=org.bouncycastle.jsse.provider.SSLSocketFactoryImpl
      </span>
    </pre>
  );
}
