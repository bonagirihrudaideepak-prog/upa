# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: debug.spec.js >> FULL SITE AUTO-DEBUG - Comprehensive Admin & Store Audit >> Crawl, log, and report all broken features
- Location: debug.spec.js:12:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "https://upanishadmobiles.com/", waiting until "networkidle"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]: bolt
        - text: ⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡
      - generic [ref=e9]:
        - generic [ref=e10]: bolt
        - text: ⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡
      - generic [ref=e11]:
        - generic [ref=e12]: bolt
        - text: ⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡
      - generic [ref=e13]:
        - generic [ref=e14]: bolt
        - text: ⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡
      - generic [ref=e15]:
        - generic [ref=e16]: bolt
        - text: ⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡
      - generic [ref=e17]:
        - generic [ref=e18]: bolt
        - text: ⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡
      - generic [ref=e19]:
        - generic [ref=e20]: bolt
        - text: ⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡
      - generic [ref=e21]:
        - generic [ref=e22]: bolt
        - text: ⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡
    - generic [ref=e23]:
      - link "Upanishad mobiles" [ref=e24] [cursor=pointer]:
        - /url: /
      - search [ref=e27]:
        - generic [ref=e28]: search
        - textbox "Search products" [ref=e29]:
          - /placeholder: Search Upanishad Mobile Store
      - navigation [ref=e30]:
        - link "All Products" [ref=e31] [cursor=pointer]:
          - /url: /catalog
  - dialog "Mobile navigation menu" [ref=e32]:
    - generic [ref=e33]:
      - generic [ref=e34]:
        - generic [ref=e35]: Categories & Menu
        - button "Close menu" [ref=e36] [cursor=pointer]:
          - generic [ref=e37]: close
      - search [ref=e40]:
        - generic [ref=e41]: search
        - textbox "Search products" [ref=e42]:
          - /placeholder: Search Upanishad Mobile Store
      - navigation "Mobile navigation" [ref=e43]:
        - generic [ref=e44]:
          - link "Home" [ref=e45] [cursor=pointer]:
            - /url: /
          - link "All Products" [ref=e46] [cursor=pointer]:
            - /url: /catalog
          - link "iPhone" [ref=e47] [cursor=pointer]:
            - /url: /category/iphone
          - link "Samsung" [ref=e48] [cursor=pointer]:
            - /url: /category/samsung
          - link "Accessories" [ref=e49] [cursor=pointer]:
            - /url: /category/accessories
          - link "Gadgets" [ref=e50] [cursor=pointer]:
            - /url: /category/gadgets
          - link "Others" [ref=e51] [cursor=pointer]:
            - /url: /category/others
          - separator [ref=e52]
          - link "New Arrivals" [ref=e53] [cursor=pointer]:
            - /url: /catalog?filter=new-arrivals
          - link "Offers" [ref=e54] [cursor=pointer]:
            - /url: /catalog?filter=offers
          - link "About Us" [ref=e55] [cursor=pointer]:
            - /url: /about
          - link "Contact Us" [ref=e56] [cursor=pointer]:
            - /url: /contact
        - separator [ref=e57]
        - generic [ref=e58]:
          - link "chat Chat on WhatsApp" [ref=e59] [cursor=pointer]:
            - /url: https://wa.me/919666731286
            - generic [ref=e60]: chat
            - text: Chat on WhatsApp
          - link "call Call Us" [ref=e61] [cursor=pointer]:
            - /url: tel:+919666731286
            - generic [ref=e62]: call
            - text: Call Us
          - link "photo_camera Follow on Instagram" [ref=e63] [cursor=pointer]:
            - /url: https://www.instagram.com/upanishadmobiles/
            - generic [ref=e64]: photo_camera
            - text: Follow on Instagram
  - main [ref=e65]:
    - generic [ref=e69]:
      - img "Mega Monsoon Sale - Up to 10% Off Mobile Accessories"
      - generic [ref=e70]:
        - heading "Mega Monsoon Sale - Up to 10% Off Mobile Accessories" [level=1] [ref=e71]
        - paragraph [ref=e72]: Grab premium iPhone & Samsung cases, screen guards, and fast chargers at unbeatable prices!
      - link "Claim Offer" [ref=e73] [cursor=pointer]:
        - /url: https://wa.me/919666731286?text=Hi!%20I%20saw%20the%20offer%20%22Mega%20Monsoon%20Sale%20-%20Up%20to%2010%25%20Off%20Mobile%20Accessories%22%20on%20your%20website.%20I'd%20like%20to%20claim%20it!
    - generic [ref=e76]:
      - heading "Shop by Category" [level=2] [ref=e77]
      - generic [ref=e78]:
        - link "iPhone iPhone" [ref=e79] [cursor=pointer]:
          - /url: /category/iphone
          - img "iPhone" [ref=e81]
          - generic [ref=e82]: iPhone
        - link "Samsung Samsung" [ref=e83] [cursor=pointer]:
          - /url: /category/samsung
          - img "Samsung" [ref=e85]
          - generic [ref=e86]: Samsung
        - link "Oppo Oppo" [ref=e87] [cursor=pointer]:
          - /url: /category/oppo
          - img "Oppo" [ref=e89]
          - generic [ref=e90]: Oppo
        - link "vivo vivo" [ref=e91] [cursor=pointer]:
          - /url: /category/vivo
          - img "vivo" [ref=e93]
          - generic [ref=e94]: vivo
        - link "Cases Cases" [ref=e95] [cursor=pointer]:
          - /url: /category/cases
          - img "Cases" [ref=e97]
          - generic [ref=e98]: Cases
        - link "Screen Guards Screen Guards" [ref=e99] [cursor=pointer]:
          - /url: /category/screen-guards
          - img "Screen Guards" [ref=e101]
          - generic [ref=e102]: Screen Guards
    - generic [ref=e103]:
      - heading "Top Recommended" [level=2] [ref=e104]
      - generic [ref=e105]:
        - link "View Henks Hazel iphone case" [ref=e106] [cursor=pointer]:
          - generic [ref=e107]:
            - img "Henks Hazel iphone case" [ref=e108]
            - generic [ref=e109]: NEW
            - generic [ref=e111]: Quick View
          - generic [ref=e113]:
            - generic [ref=e114]:
              - generic [ref=e115]: iPhone
              - heading "Henks Hazel iphone case" [level=3] [ref=e117]
              - generic [ref=e118]:
                - generic [ref=e119]: "Colors:"
                - generic "Midnight Black" [ref=e121]
            - generic [ref=e122]:
              - paragraph [ref=e123]: ₹2,000
              - button "Like Henks Hazel iphone case" [ref=e125]:
                - generic [ref=e126]: favorite
                - generic [ref=e127]: "54"
        - link "View iPhone 17 Pro Max" [ref=e128] [cursor=pointer]:
          - generic [ref=e129]:
            - generic [ref=e130]: image
            - generic [ref=e132]: NEW
            - generic [ref=e134]: Quick View
          - generic [ref=e136]:
            - generic [ref=e137]:
              - generic [ref=e138]: iPhone
              - heading "iPhone 17 Pro Max" [level=3] [ref=e140]
            - generic [ref=e141]:
              - paragraph [ref=e142]: ₹1,34,999
              - button "Like iPhone 17 Pro Max" [ref=e144]:
                - generic [ref=e145]: favorite
                - generic [ref=e146]: 1.4k
        - link "View Samsung Galaxy S25 Ultra" [ref=e147] [cursor=pointer]:
          - generic [ref=e148]:
            - generic [ref=e149]: image
            - generic [ref=e151]:
              - generic [ref=e152]: NEW
              - generic [ref=e153]: OFFER
            - generic [ref=e154]: Quick View
          - generic [ref=e156]:
            - generic [ref=e157]:
              - generic [ref=e158]: Samsung
              - heading "Samsung Galaxy S25 Ultra" [level=3] [ref=e160]
            - generic [ref=e161]:
              - paragraph [ref=e162]: ₹1,29,999
              - button "Like Samsung Galaxy S25 Ultra" [ref=e164]:
                - generic [ref=e165]: favorite
                - generic [ref=e166]: 2.1k
        - link "View Oppo Find X7 Ultra" [ref=e167] [cursor=pointer]:
          - generic [ref=e168]:
            - generic [ref=e169]: image
            - generic [ref=e171]: NEW
            - generic [ref=e173]: Quick View
          - generic [ref=e175]:
            - generic [ref=e176]:
              - generic [ref=e177]: Oppo
              - heading "Oppo Find X7 Ultra" [level=3] [ref=e179]
            - generic [ref=e180]:
              - paragraph [ref=e181]: ₹74,999
              - button "Like Oppo Find X7 Ultra" [ref=e183]:
                - generic [ref=e184]: favorite
                - generic [ref=e185]: "890"
        - link "View Vivo X100 Pro" [ref=e186] [cursor=pointer]:
          - generic [ref=e187]:
            - generic [ref=e188]: image
            - generic [ref=e190]: NEW
            - generic [ref=e192]: Quick View
          - generic [ref=e194]:
            - generic [ref=e195]:
              - generic [ref=e196]: Vivo
              - heading "Vivo X100 Pro" [level=3] [ref=e198]
            - generic [ref=e199]:
              - paragraph [ref=e200]: ₹89,999
              - button "Like Vivo X100 Pro" [ref=e202]:
                - generic [ref=e203]: favorite
                - generic [ref=e204]: "960"
        - link "View MagSafe Premium Leather Case" [ref=e205] [cursor=pointer]:
          - generic [ref=e206]:
            - generic [ref=e207]: image
            - generic [ref=e209]:
              - generic [ref=e210]: NEW
              - generic [ref=e211]: OFFER
            - generic [ref=e212]: Quick View
          - generic [ref=e214]:
            - generic [ref=e215]:
              - generic [ref=e216]: Cases
              - heading "MagSafe Premium Leather Case" [level=3] [ref=e218]
            - generic [ref=e219]:
              - paragraph [ref=e220]: ₹1,499
              - button "Like MagSafe Premium Leather Case" [ref=e222]:
                - generic [ref=e223]: favorite
                - generic [ref=e224]: 3.9k
        - link "View 9H Ultra HD Tempered Glass Guard" [ref=e225] [cursor=pointer]:
          - generic [ref=e226]:
            - generic [ref=e227]: image
            - generic [ref=e229]:
              - generic [ref=e230]: NEW
              - generic [ref=e231]: OFFER
            - generic [ref=e232]: Quick View
          - generic [ref=e234]:
            - generic [ref=e235]:
              - generic [ref=e236]: Screen Guards
              - heading "9H Ultra HD Tempered Glass Guard" [level=3] [ref=e238]
            - generic [ref=e239]:
              - paragraph [ref=e240]: ₹499
              - button "Like 9H Ultra HD Tempered Glass Guard" [ref=e242]:
                - generic [ref=e243]: favorite
                - generic [ref=e244]: 4.2k
        - link "View Customized Photo Printed Glass Cover" [ref=e245] [cursor=pointer]:
          - generic [ref=e246]:
            - generic [ref=e247]: image
            - generic [ref=e249]:
              - generic [ref=e250]: NEW
              - generic [ref=e251]: OFFER
            - generic [ref=e252]: Quick View
          - generic [ref=e254]:
            - generic [ref=e255]:
              - generic [ref=e256]: Cases
              - heading "Customized Photo Printed Glass Cover" [level=3] [ref=e258]
            - generic [ref=e259]:
              - paragraph [ref=e260]: ₹799
              - button "Like Customized Photo Printed Glass Cover" [ref=e262]:
                - generic [ref=e263]: favorite
                - generic [ref=e264]: 5.1k
    - generic [ref=e265]:
      - generic [ref=e266]:
        - heading "New Arrivals" [level=2] [ref=e267]
        - link "View all" [ref=e268] [cursor=pointer]:
          - /url: /catalog?filter=new-arrivals
      - generic [ref=e269]:
        - link "View Henks Hazel iphone case" [ref=e270] [cursor=pointer]:
          - generic [ref=e271]:
            - img "Henks Hazel iphone case" [ref=e272]
            - generic [ref=e273]: NEW
            - generic [ref=e275]: Quick View
          - generic [ref=e277]:
            - generic [ref=e278]:
              - generic [ref=e279]: iPhone
              - heading "Henks Hazel iphone case" [level=3] [ref=e281]
              - generic [ref=e282]:
                - generic [ref=e283]: "Colors:"
                - generic "Midnight Black" [ref=e285]
            - generic [ref=e286]:
              - paragraph [ref=e287]: ₹2,000
              - button "Like Henks Hazel iphone case" [ref=e289]:
                - generic [ref=e290]: favorite
                - generic [ref=e291]: "54"
        - link "View Wireless Noise Cancelling Earbuds Pro" [ref=e292] [cursor=pointer]:
          - generic [ref=e293]:
            - generic [ref=e294]: image
            - generic [ref=e296]: NEW
            - generic [ref=e298]: Quick View
          - generic [ref=e300]:
            - generic [ref=e301]:
              - generic [ref=e302]: Electronics
              - heading "Wireless Noise Cancelling Earbuds Pro" [level=3] [ref=e304]
            - generic [ref=e305]:
              - paragraph [ref=e306]: ₹4,999
              - button "Like Wireless Noise Cancelling Earbuds Pro" [ref=e308]:
                - generic [ref=e309]: favorite
                - generic [ref=e310]: 1.9k
        - link "View Customized Photo Printed Glass Cover" [ref=e311] [cursor=pointer]:
          - generic [ref=e312]:
            - generic [ref=e313]: image
            - generic [ref=e315]:
              - generic [ref=e316]: NEW
              - generic [ref=e317]: OFFER
            - generic [ref=e318]: Quick View
          - generic [ref=e320]:
            - generic [ref=e321]:
              - generic [ref=e322]: Cases
              - heading "Customized Photo Printed Glass Cover" [level=3] [ref=e324]
            - generic [ref=e325]:
              - paragraph [ref=e326]: ₹799
              - button "Like Customized Photo Printed Glass Cover" [ref=e328]:
                - generic [ref=e329]: favorite
                - generic [ref=e330]: 5.1k
        - link "View 9H Ultra HD Tempered Glass Guard" [ref=e331] [cursor=pointer]:
          - generic [ref=e332]:
            - generic [ref=e333]: image
            - generic [ref=e335]:
              - generic [ref=e336]: NEW
              - generic [ref=e337]: OFFER
            - generic [ref=e338]: Quick View
          - generic [ref=e340]:
            - generic [ref=e341]:
              - generic [ref=e342]: Screen Guards
              - heading "9H Ultra HD Tempered Glass Guard" [level=3] [ref=e344]
            - generic [ref=e345]:
              - paragraph [ref=e346]: ₹499
              - button "Like 9H Ultra HD Tempered Glass Guard" [ref=e348]:
                - generic [ref=e349]: favorite
                - generic [ref=e350]: 4.2k
        - link "View MagSafe Premium Leather Case" [ref=e351] [cursor=pointer]:
          - generic [ref=e352]:
            - generic [ref=e353]: image
            - generic [ref=e355]:
              - generic [ref=e356]: NEW
              - generic [ref=e357]: OFFER
            - generic [ref=e358]: Quick View
          - generic [ref=e360]:
            - generic [ref=e361]:
              - generic [ref=e362]: Cases
              - heading "MagSafe Premium Leather Case" [level=3] [ref=e364]
            - generic [ref=e365]:
              - paragraph [ref=e366]: ₹1,499
              - button "Like MagSafe Premium Leather Case" [ref=e368]:
                - generic [ref=e369]: favorite
                - generic [ref=e370]: 3.9k
        - link "View Vivo X100 Pro" [ref=e371] [cursor=pointer]:
          - generic [ref=e372]:
            - generic [ref=e373]: image
            - generic [ref=e375]: NEW
            - generic [ref=e377]: Quick View
          - generic [ref=e379]:
            - generic [ref=e380]:
              - generic [ref=e381]: Vivo
              - heading "Vivo X100 Pro" [level=3] [ref=e383]
            - generic [ref=e384]:
              - paragraph [ref=e385]: ₹89,999
              - button "Like Vivo X100 Pro" [ref=e387]:
                - generic [ref=e388]: favorite
                - generic [ref=e389]: "960"
        - link "View Oppo Find X7 Ultra" [ref=e390] [cursor=pointer]:
          - generic [ref=e391]:
            - generic [ref=e392]: image
            - generic [ref=e394]: NEW
            - generic [ref=e396]: Quick View
          - generic [ref=e398]:
            - generic [ref=e399]:
              - generic [ref=e400]: Oppo
              - heading "Oppo Find X7 Ultra" [level=3] [ref=e402]
            - generic [ref=e403]:
              - paragraph [ref=e404]: ₹74,999
              - button "Like Oppo Find X7 Ultra" [ref=e406]:
                - generic [ref=e407]: favorite
                - generic [ref=e408]: "890"
        - link "View Samsung Galaxy S25 Ultra" [ref=e409] [cursor=pointer]:
          - generic [ref=e410]:
            - generic [ref=e411]: image
            - generic [ref=e413]:
              - generic [ref=e414]: NEW
              - generic [ref=e415]: OFFER
            - generic [ref=e416]: Quick View
          - generic [ref=e418]:
            - generic [ref=e419]:
              - generic [ref=e420]: Samsung
              - heading "Samsung Galaxy S25 Ultra" [level=3] [ref=e422]
            - generic [ref=e423]:
              - paragraph [ref=e424]: ₹1,29,999
              - button "Like Samsung Galaxy S25 Ultra" [ref=e426]:
                - generic [ref=e427]: favorite
                - generic [ref=e428]: 2.1k
    - generic [ref=e429]:
      - generic [ref=e430]:
        - heading "iPhone" [level=2] [ref=e431]
        - link "View all" [ref=e432] [cursor=pointer]:
          - /url: /category/iphone
      - generic [ref=e433]:
        - link "View Henks Hazel iphone case" [ref=e434] [cursor=pointer]:
          - generic [ref=e435]:
            - img "Henks Hazel iphone case" [ref=e436]
            - generic [ref=e437]: NEW
            - generic [ref=e439]: Quick View
          - generic [ref=e441]:
            - generic [ref=e442]:
              - generic [ref=e443]: iPhone
              - heading "Henks Hazel iphone case" [level=3] [ref=e445]
              - generic [ref=e446]:
                - generic [ref=e447]: "Colors:"
                - generic "Midnight Black" [ref=e449]
            - generic [ref=e450]:
              - paragraph [ref=e451]: ₹2,000
              - button "Like Henks Hazel iphone case" [ref=e453]:
                - generic [ref=e454]: favorite
                - generic [ref=e455]: "54"
        - link "View iPhone 17 Pro Max" [ref=e456] [cursor=pointer]:
          - generic [ref=e457]:
            - generic [ref=e458]: image
            - generic [ref=e460]: NEW
            - generic [ref=e462]: Quick View
          - generic [ref=e464]:
            - generic [ref=e465]:
              - generic [ref=e466]: iPhone
              - heading "iPhone 17 Pro Max" [level=3] [ref=e468]
            - generic [ref=e469]:
              - paragraph [ref=e470]: ₹1,34,999
              - button "Like iPhone 17 Pro Max" [ref=e472]:
                - generic [ref=e473]: favorite
                - generic [ref=e474]: 1.4k
    - generic [ref=e475]:
      - generic [ref=e476]:
        - heading "Samsung" [level=2] [ref=e477]
        - link "View all" [ref=e478] [cursor=pointer]:
          - /url: /category/samsung
      - link "View Samsung Galaxy S25 Ultra" [ref=e480] [cursor=pointer]:
        - generic [ref=e481]:
          - generic [ref=e482]: image
          - generic [ref=e484]:
            - generic [ref=e485]: NEW
            - generic [ref=e486]: OFFER
          - generic [ref=e487]: Quick View
        - generic [ref=e489]:
          - generic [ref=e490]:
            - generic [ref=e491]: Samsung
            - heading "Samsung Galaxy S25 Ultra" [level=3] [ref=e493]
          - generic [ref=e494]:
            - paragraph [ref=e495]: ₹1,29,999
            - button "Like Samsung Galaxy S25 Ultra" [ref=e497]:
              - generic [ref=e498]: favorite
              - generic [ref=e499]: 2.1k
    - generic [ref=e500]:
      - generic [ref=e501]:
        - heading "Oppo" [level=2] [ref=e502]
        - link "View all" [ref=e503] [cursor=pointer]:
          - /url: /category/oppo
      - link "View Oppo Find X7 Ultra" [ref=e505] [cursor=pointer]:
        - generic [ref=e506]:
          - generic [ref=e507]: image
          - generic [ref=e509]: NEW
          - generic [ref=e511]: Quick View
        - generic [ref=e513]:
          - generic [ref=e514]:
            - generic [ref=e515]: Oppo
            - heading "Oppo Find X7 Ultra" [level=3] [ref=e517]
          - generic [ref=e518]:
            - paragraph [ref=e519]: ₹74,999
            - button "Like Oppo Find X7 Ultra" [ref=e521]:
              - generic [ref=e522]: favorite
              - generic [ref=e523]: "890"
    - generic [ref=e524]:
      - generic [ref=e525]:
        - heading "vivo" [level=2] [ref=e526]
        - link "View all" [ref=e527] [cursor=pointer]:
          - /url: /category/vivo
      - link "View Vivo X100 Pro" [ref=e529] [cursor=pointer]:
        - generic [ref=e530]:
          - generic [ref=e531]: image
          - generic [ref=e533]: NEW
          - generic [ref=e535]: Quick View
        - generic [ref=e537]:
          - generic [ref=e538]:
            - generic [ref=e539]: Vivo
            - heading "Vivo X100 Pro" [level=3] [ref=e541]
          - generic [ref=e542]:
            - paragraph [ref=e543]: ₹89,999
            - button "Like Vivo X100 Pro" [ref=e545]:
              - generic [ref=e546]: favorite
              - generic [ref=e547]: "960"
    - generic [ref=e548]:
      - generic [ref=e549]:
        - heading "Cases" [level=2] [ref=e550]
        - link "View all" [ref=e551] [cursor=pointer]:
          - /url: /category/cases
      - generic [ref=e552]:
        - link "View MagSafe Premium Leather Case" [ref=e553] [cursor=pointer]:
          - generic [ref=e554]:
            - generic [ref=e555]: image
            - generic [ref=e557]:
              - generic [ref=e558]: NEW
              - generic [ref=e559]: OFFER
            - generic [ref=e560]: Quick View
          - generic [ref=e562]:
            - generic [ref=e563]:
              - generic [ref=e564]: Cases
              - heading "MagSafe Premium Leather Case" [level=3] [ref=e566]
            - generic [ref=e567]:
              - paragraph [ref=e568]: ₹1,499
              - button "Like MagSafe Premium Leather Case" [ref=e570]:
                - generic [ref=e571]: favorite
                - generic [ref=e572]: 3.9k
        - link "View Customized Photo Printed Glass Cover" [ref=e573] [cursor=pointer]:
          - generic [ref=e574]:
            - generic [ref=e575]: image
            - generic [ref=e577]:
              - generic [ref=e578]: NEW
              - generic [ref=e579]: OFFER
            - generic [ref=e580]: Quick View
          - generic [ref=e582]:
            - generic [ref=e583]:
              - generic [ref=e584]: Cases
              - heading "Customized Photo Printed Glass Cover" [level=3] [ref=e586]
            - generic [ref=e587]:
              - paragraph [ref=e588]: ₹799
              - button "Like Customized Photo Printed Glass Cover" [ref=e590]:
                - generic [ref=e591]: favorite
                - generic [ref=e592]: 5.1k
    - generic [ref=e593]:
      - generic [ref=e594]:
        - heading "Screen Guards" [level=2] [ref=e595]
        - link "View all" [ref=e596] [cursor=pointer]:
          - /url: /category/screen-guards
      - link "View 9H Ultra HD Tempered Glass Guard" [ref=e598] [cursor=pointer]:
        - generic [ref=e599]:
          - generic [ref=e600]: image
          - generic [ref=e602]:
            - generic [ref=e603]: NEW
            - generic [ref=e604]: OFFER
          - generic [ref=e605]: Quick View
        - generic [ref=e607]:
          - generic [ref=e608]:
            - generic [ref=e609]: Screen Guards
            - heading "9H Ultra HD Tempered Glass Guard" [level=3] [ref=e611]
          - generic [ref=e612]:
            - paragraph [ref=e613]: ₹499
            - button "Like 9H Ultra HD Tempered Glass Guard" [ref=e615]:
              - generic [ref=e616]: favorite
              - generic [ref=e617]: 4.2k
    - generic [ref=e618]:
      - generic [ref=e619]:
        - heading "All Products" [level=2] [ref=e620]
        - link "View all" [ref=e621] [cursor=pointer]:
          - /url: /catalog
      - generic [ref=e622]:
        - link "View Henks Hazel iphone case" [ref=e623] [cursor=pointer]:
          - generic [ref=e624]:
            - img "Henks Hazel iphone case" [ref=e625]
            - generic [ref=e626]: NEW
            - generic [ref=e628]: Quick View
          - generic [ref=e630]:
            - generic [ref=e631]:
              - generic [ref=e632]: iPhone
              - heading "Henks Hazel iphone case" [level=3] [ref=e634]
              - generic [ref=e635]:
                - generic [ref=e636]: "Colors:"
                - generic "Midnight Black" [ref=e638]
            - generic [ref=e639]:
              - paragraph [ref=e640]: ₹2,000
              - button "Like Henks Hazel iphone case" [ref=e642]:
                - generic [ref=e643]: favorite
                - generic [ref=e644]: "54"
        - link "View iPhone 17 Pro Max" [ref=e645] [cursor=pointer]:
          - generic [ref=e646]:
            - generic [ref=e647]: image
            - generic [ref=e649]: NEW
            - generic [ref=e651]: Quick View
          - generic [ref=e653]:
            - generic [ref=e654]:
              - generic [ref=e655]: iPhone
              - heading "iPhone 17 Pro Max" [level=3] [ref=e657]
            - generic [ref=e658]:
              - paragraph [ref=e659]: ₹1,34,999
              - button "Like iPhone 17 Pro Max" [ref=e661]:
                - generic [ref=e662]: favorite
                - generic [ref=e663]: 1.4k
        - link "View Samsung Galaxy S25 Ultra" [ref=e664] [cursor=pointer]:
          - generic [ref=e665]:
            - generic [ref=e666]: image
            - generic [ref=e668]:
              - generic [ref=e669]: NEW
              - generic [ref=e670]: OFFER
            - generic [ref=e671]: Quick View
          - generic [ref=e673]:
            - generic [ref=e674]:
              - generic [ref=e675]: Samsung
              - heading "Samsung Galaxy S25 Ultra" [level=3] [ref=e677]
            - generic [ref=e678]:
              - paragraph [ref=e679]: ₹1,29,999
              - button "Like Samsung Galaxy S25 Ultra" [ref=e681]:
                - generic [ref=e682]: favorite
                - generic [ref=e683]: 2.1k
        - link "View Oppo Find X7 Ultra" [ref=e684] [cursor=pointer]:
          - generic [ref=e685]:
            - generic [ref=e686]: image
            - generic [ref=e688]: NEW
            - generic [ref=e690]: Quick View
          - generic [ref=e692]:
            - generic [ref=e693]:
              - generic [ref=e694]: Oppo
              - heading "Oppo Find X7 Ultra" [level=3] [ref=e696]
            - generic [ref=e697]:
              - paragraph [ref=e698]: ₹74,999
              - button "Like Oppo Find X7 Ultra" [ref=e700]:
                - generic [ref=e701]: favorite
                - generic [ref=e702]: "890"
        - link "View Vivo X100 Pro" [ref=e703] [cursor=pointer]:
          - generic [ref=e704]:
            - generic [ref=e705]: image
            - generic [ref=e707]: NEW
            - generic [ref=e709]: Quick View
          - generic [ref=e711]:
            - generic [ref=e712]:
              - generic [ref=e713]: Vivo
              - heading "Vivo X100 Pro" [level=3] [ref=e715]
            - generic [ref=e716]:
              - paragraph [ref=e717]: ₹89,999
              - button "Like Vivo X100 Pro" [ref=e719]:
                - generic [ref=e720]: favorite
                - generic [ref=e721]: "960"
        - link "View MagSafe Premium Leather Case" [ref=e722] [cursor=pointer]:
          - generic [ref=e723]:
            - generic [ref=e724]: image
            - generic [ref=e726]:
              - generic [ref=e727]: NEW
              - generic [ref=e728]: OFFER
            - generic [ref=e729]: Quick View
          - generic [ref=e731]:
            - generic [ref=e732]:
              - generic [ref=e733]: Cases
              - heading "MagSafe Premium Leather Case" [level=3] [ref=e735]
            - generic [ref=e736]:
              - paragraph [ref=e737]: ₹1,499
              - button "Like MagSafe Premium Leather Case" [ref=e739]:
                - generic [ref=e740]: favorite
                - generic [ref=e741]: 3.9k
        - link "View 9H Ultra HD Tempered Glass Guard" [ref=e742] [cursor=pointer]:
          - generic [ref=e743]:
            - generic [ref=e744]: image
            - generic [ref=e746]:
              - generic [ref=e747]: NEW
              - generic [ref=e748]: OFFER
            - generic [ref=e749]: Quick View
          - generic [ref=e751]:
            - generic [ref=e752]:
              - generic [ref=e753]: Screen Guards
              - heading "9H Ultra HD Tempered Glass Guard" [level=3] [ref=e755]
            - generic [ref=e756]:
              - paragraph [ref=e757]: ₹499
              - button "Like 9H Ultra HD Tempered Glass Guard" [ref=e759]:
                - generic [ref=e760]: favorite
                - generic [ref=e761]: 4.2k
        - link "View Customized Photo Printed Glass Cover" [ref=e762] [cursor=pointer]:
          - generic [ref=e763]:
            - generic [ref=e764]: image
            - generic [ref=e766]:
              - generic [ref=e767]: NEW
              - generic [ref=e768]: OFFER
            - generic [ref=e769]: Quick View
          - generic [ref=e771]:
            - generic [ref=e772]:
              - generic [ref=e773]: Cases
              - heading "Customized Photo Printed Glass Cover" [level=3] [ref=e775]
            - generic [ref=e776]:
              - paragraph [ref=e777]: ₹799
              - button "Like Customized Photo Printed Glass Cover" [ref=e779]:
                - generic [ref=e780]: favorite
                - generic [ref=e781]: 5.1k
        - link "View Wireless Noise Cancelling Earbuds Pro" [ref=e782] [cursor=pointer]:
          - generic [ref=e783]:
            - generic [ref=e784]: image
            - generic [ref=e786]: NEW
            - generic [ref=e788]: Quick View
          - generic [ref=e790]:
            - generic [ref=e791]:
              - generic [ref=e792]: Electronics
              - heading "Wireless Noise Cancelling Earbuds Pro" [level=3] [ref=e794]
            - generic [ref=e795]:
              - paragraph [ref=e796]: ₹4,999
              - button "Like Wireless Noise Cancelling Earbuds Pro" [ref=e798]:
                - generic [ref=e799]: favorite
                - generic [ref=e800]: 1.9k
  - link "Chat on WhatsApp" [ref=e803] [cursor=pointer]:
    - /url: https://wa.me/919666731286
  - link "Call us" [ref=e808] [cursor=pointer]:
    - /url: tel:+919666731286
    - generic [ref=e809]: call
  - contentinfo [ref=e810]:
    - generic [ref=e811]:
      - generic [ref=e812]:
        - generic [ref=e813]:
          - link "Upanishad mobiles" [ref=e814] [cursor=pointer]:
            - /url: /
          - paragraph [ref=e815]: Store Pickup Only • Premium Smartphones, Cases & Accessories
        - generic [ref=e816]:
          - heading "Explore" [level=3] [ref=e817]
          - link "Home" [ref=e818] [cursor=pointer]:
            - /url: /
          - link "All Products" [ref=e819] [cursor=pointer]:
            - /url: /catalog
          - link "About Us" [ref=e820] [cursor=pointer]:
            - /url: /about
          - link "Contact Us" [ref=e821] [cursor=pointer]:
            - /url: /contact
        - generic [ref=e822]:
          - heading "Get in Touch" [level=3] [ref=e823]
          - link "call +91 96667 31286" [ref=e824] [cursor=pointer]:
            - /url: tel:+919666731286
            - generic [ref=e825]: call
            - text: +91 96667 31286
        - generic [ref=e826]:
          - heading "Store Location" [level=3] [ref=e827]
          - link "location_on View on Google Maps" [ref=e828] [cursor=pointer]:
            - /url: https://maps.app.goo.gl/JRej6So64iYYm7ia6
            - generic [ref=e829]: location_on
            - text: View on Google Maps
          - link "Instagram" [ref=e831] [cursor=pointer]:
            - /url: https://www.instagram.com/upanishadmobiles/
            - generic [ref=e832]: photo_camera
      - generic [ref=e833]:
        - paragraph [ref=e834]: © 2026 Upanishad mobiles. All rights reserved.
        - paragraph [ref=e835]: Store Takeaway & Pickup Orders Only
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | 
  3   | // ===== STORE CONFIGURATION =====
  4   | const BASE_URL = 'https://upanishadmobiles.com';
  5   | const ADMIN_URL = `${BASE_URL}/admin`;
  6   | const USERNAME = 'Test123admin01';
  7   | const PASSWORD = 'Flipkartzon01123';
  8   | // ================================
  9   | 
  10  | test.describe('FULL SITE AUTO-DEBUG - Comprehensive Admin & Store Audit', () => {
  11  | 
  12  |   test('Crawl, log, and report all broken features', async ({ page }) => {
  13  | 
  14  |     const consoleErrors = [];
  15  |     const networkErrors = [];
  16  |     const uiMissingElements = [];
  17  | 
  18  |     // 1. Listen to JS console errors
  19  |     page.on('console', msg => {
  20  |       if (msg.type() === 'error') {
  21  |         const text = msg.text();
  22  |         // Ignore extension or analytics errors
  23  |         if (!text.includes('chrome-extension') && !text.includes('favicon')) {
  24  |           consoleErrors.push({ text: msg.text(), location: msg.location() });
  25  |         }
  26  |       }
  27  |     });
  28  | 
  29  |     // 2. Listen to failed network requests (400+)
  30  |     page.on('response', response => {
  31  |       if (response.status() >= 400) {
  32  |         networkErrors.push({
  33  |           url: response.url(),
  34  |           status: response.status(),
  35  |           statusText: response.statusText()
  36  |         });
  37  |       }
  38  |     });
  39  | 
  40  |     console.log('🚀 Starting Automated Playwright Audit on', BASE_URL);
  41  | 
  42  |     // 3. STOREFRONT HOMEPAGE & CATALOG AUDIT
  43  |     console.log('🔍 [TEST 1] Auditing Public Storefront & Product Cards...');
> 44  |     await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      |                ^ Error: page.goto: Test timeout of 30000ms exceeded.
  45  | 
  46  |     // Check homepage title & product cards
  47  |     const productCards = await page.locator('[role="link"][aria-label*="View"]').all();
  48  |     console.log(`   ✅ Found ${productCards.length} product cards on Homepage`);
  49  | 
  50  |     // Check catalog page
  51  |     await page.goto(`${BASE_URL}/catalog`, { waitUntil: 'networkidle' });
  52  |     const catalogCards = await page.locator('[role="link"][aria-label*="View"]').all();
  53  |     console.log(`   ✅ Found ${catalogCards.length} product cards in Catalog`);
  54  | 
  55  |     // Test detail page model/color dynamic availability filtering
  56  |     if (catalogCards.length > 0) {
  57  |       await catalogCards[0].click();
  58  |       await page.waitForTimeout(1000);
  59  |       const modelSelect = page.locator('select').first();
  60  |       if (await modelSelect.count() > 0) {
  61  |         const options = await modelSelect.locator('option').allTextContents();
  62  |         console.log(`   ✅ Product detail model dropdown options: ${options.filter(o => o.trim()).join(', ')}`);
  63  |       }
  64  |     }
  65  | 
  66  |     // 4. ADMIN LOGIN TEST
  67  |     console.log('🔍 [TEST 2] Testing Admin Login & Auth Token generation...');
  68  |     await page.goto(ADMIN_URL, { waitUntil: 'networkidle' });
  69  | 
  70  |     // Fill login inputs
  71  |     const usernameInput = page.locator('input[placeholder*="username" i], input[type="text"]').first();
  72  |     const passwordInput = page.locator('input[type="password"]').first();
  73  |     const submitBtn = page.locator('button[type="submit"]').first();
  74  | 
  75  |     await usernameInput.fill(USERNAME);
  76  |     await passwordInput.fill(PASSWORD);
  77  |     await submitBtn.click();
  78  |     await page.waitForTimeout(1500);
  79  | 
  80  |     // Verify redirected or logged in
  81  |     const currentUrl = page.url();
  82  |     if (currentUrl.includes('/admin/dashboard') || currentUrl.includes('/admin')) {
  83  |       console.log('   ✅ Admin Login Successful!');
  84  |     } else {
  85  |       uiMissingElements.push(`❌ Admin login failed. Page stayed at ${currentUrl}`);
  86  |     }
  87  | 
  88  |     // 5. TEST ADD/EDIT PRODUCT PAGE (PHONE MODELS & UPLOADER)
  89  |     console.log('🔍 [TEST 3] Checking Product Form (Phone Models & Image Uploader)...');
  90  |     await page.goto(`${ADMIN_URL}/products/new`, { waitUntil: 'networkidle' });
  91  | 
  92  |     // Check for ImageUploader tabs (Browse, Drag & Drop, External URL)
  93  |     const browseTab = page.locator('button:has-text("Browse File")');
  94  |     const dragTab = page.locator('button:has-text("Drag & Drop")');
  95  |     const urlTab = page.locator('button:has-text("External URL")');
  96  | 
  97  |     if (await browseTab.count() > 0 && await dragTab.count() > 0 && await urlTab.count() > 0) {
  98  |       console.log('   ✅ Unified ImageUploader is active with Browse, Drag & Drop, and External URL tabs.');
  99  |     } else {
  100 |       uiMissingElements.push('❌ ImageUploader tabs missing on Product form page.');
  101 |     }
  102 | 
  103 |     // Test model inputs
  104 |     const modelInput = page.locator('input[placeholder*="model" i]').first();
  105 |     if (await modelInput.count() > 0) {
  106 |       console.log('   ✅ Phone model input field is present and accessible.');
  107 |     }
  108 | 
  109 |     // 6. TEST CATEGORIES MANAGEMENT (EDIT, DELETE, IMAGE UPLOAD)
  110 |     console.log('🔍 [TEST 4] Testing Category Management & Edit/Delete Buttons...');
  111 |     await page.goto(`${ADMIN_URL}/categories`, { waitUntil: 'networkidle' });
  112 | 
  113 |     const editBtns = page.locator('button:has-text("Edit")');
  114 |     const deleteBtns = page.locator('button:has-text("Delete")');
  115 | 
  116 |     if (await editBtns.count() > 0 && await deleteBtns.count() > 0) {
  117 |       console.log(`   ✅ Category Edit (${await editBtns.count()}) and Delete (${await deleteBtns.count()}) buttons present.`);
  118 |     } else {
  119 |       uiMissingElements.push('❌ Category Edit or Delete buttons missing from category table.');
  120 |     }
  121 | 
  122 |     // Test category creation modal & uploader
  123 |     const addCatBtn = page.locator('button:has-text("Add Category")').first();
  124 |     if (await addCatBtn.count() > 0) {
  125 |       await addCatBtn.click();
  126 |       await page.waitForTimeout(500);
  127 |       const catUploader = page.locator('button:has-text("Browse File")');
  128 |       if (await catUploader.count() > 0) {
  129 |         console.log('   ✅ Category modal contains unified ImageUploader.');
  130 |       } else {
  131 |         uiMissingElements.push('❌ Category modal missing ImageUploader component.');
  132 |       }
  133 |       // Close modal
  134 |       const closeBtn = page.locator('button:has-text("close")').first();
  135 |       if (await closeBtn.count() > 0) await closeBtn.click();
  136 |     }
  137 | 
  138 |     // 7. CRAWL ALL ADMIN ROUTES
  139 |     console.log('🔍 [TEST 5] Crawling all Admin Navigation routes...');
  140 |     const adminRoutes = [
  141 |       '/admin/dashboard',
  142 |       '/admin/products',
  143 |       '/admin/categories',
  144 |       '/admin/offers'
```