Deliverables
### 1. Source Code: All HTML, CSS, and JavaScript files
File structure:
cryptoZ/
├── index.html
├── style.css
└── script.js

### 2. API Documentation: CoinGecko API

Why CoinGecko?
- Free tier with no API key required for basic endpoints
- Supports 10,000+ cryptocurrencies and 80+ fiat currencies
- Provides real-time and historical price data
- RESTful API with JSON responses, easy to integrate with vanilla JS

Endpoints Used:
1. Simple Price API  
   GET https://api.coingecko.com/api/v3/simple/price?ids={id}&vs_currencies={currency}
   - Used for real-time conversion rates
   - Example: /simple/price?ids=bitcoin&vs_currencies=usd,eur
   - Returns: {"bitcoin":{"usd":65000,"eur":60000}}

2. Rate Limiting: 50 calls/minute for free tier. Implemented 400ms debounce to avoid hitting limits.

Implementation Flow:
1. User selects from and to currencies from dropdowns
2. JS maps short codes to CoinGecko IDs using coinGeckoMap
3. Fetch request sent to Simple Price endpoint
4. Response parsed and result calculated: amount * rate
5. Result displayed in "Converted to" field with error handling for network failures

Error Handling:
- Invalid input: Clears output field
- API failure: Shows user-friendly error message
- Same currency: Returns original amount without API call

### 3. Testing Report

Testing Objective: Verify responsiveness and functionality across devices and browsers.
Test Case                          	Device/Browser	                                              Result		                                            Notes
*Layout Responsiveness*	            Chrome DevTools: iPhone 14, iPad, Desktop 1920px	            Pass	                                                Grid stacks to 1 column below 968px. Email form stacks vertically. Nav collapses to side drawer.
*Navigation Menu*	                  Chrome Mobile, Safari iOS	                                    Pass	                                                Hamburger opens side drawer. Overlay closes menu. Body scroll locked when open.
*Currency Conversion*	              Chrome, Firefox, Safari	                                      Pass	                                                Live rates fetch correctly for BTC, ETH, fiat pairs. Debounce prevents excess API calls.
*Historical Rates*	                Chrome Desktop	                                              Pass	                                                Date picker restricts to past 1 year. Historical data loads for crypto-fiat pairs.
*Email Form*	                      All devices	                                                  Pass	                                                HTML5 validation works. Alert displays on submit.
*Stats Animation*	                  Chrome, Safari		                                            Pass	                                                Numbers animate when scrolled into view using Intersection Observer.
*API Error Handling*	              Chrome DevTools Offline mode	                                Pass	                                                Error message displays. App doesn’t break on network failure.
*Performance*	                      Lighthouse Mobile	Score 92+	Images optimized.                 CSS/JS minified.                                      [Deliverables.docx](https://github.com/user-attachments/files/28233451/Deliverables.docx)
No render-blocking resources.

Issues Found & Fixed:
1. Issue: Email form didn’t stack on mobile  
   Fix: Added flex-direction: column in media query
2. Issue: Nav buttons hidden on mobile with no access  
   Fix: Implemented slide-in side drawer using fixed positioning
3. Issue: Status bar overlapped sticky header  
   Fix: Added top: 32px to header in mobile view

Browser Compatibility Tested:
-Microsoft Edge
- Chrome 120+
- Safari 17+
- Firefox 120+
- Mobile Safari iOS 17
- Chrome Android 120

---
