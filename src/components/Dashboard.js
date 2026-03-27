import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiLogOut,
  FiMapPin,
  FiNavigation,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiZap
} from 'react-icons/fi';
import { FaTrainSubway, FaMapLocationDot } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import {
  bookTicket,
  getFare,
  getMyTickets,
  getStations,
  payTicket
} from '../services/metroApi';
import hmrlLogo from '../assets/logos/hmrl-logo.svg';
import redLineLogo from '../assets/logos/red-line-logo.svg';
import blueLineLogo from '../assets/logos/blue-line-logo.svg';
import greenLineLogo from '../assets/logos/green-line-logo.svg';
import metroTrainArrival from '../assets/logos/metro-train-arrival.svg';
import './Dashboard.css';

const getTodayForInput = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

const INTERCHANGE_STATIONS = ['Ameerpet', 'MGBS'];

const Dashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [fareInfo, setFareInfo] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedQrTicket, setSelectedQrTicket] = useState(null);
  const [qrImage, setQrImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [calculatingFare, setCalculatingFare] = useState(false);
  const [booking, setBooking] = useState(false);
  const [payingTicketId, setPayingTicketId] = useState('');
  const [pageError, setPageError] = useState('');
  const [flashMessage, setFlashMessage] = useState('');
  const [activeLine, setActiveLine] = useState('all');
  const [stationPickerTarget, setStationPickerTarget] = useState('fromStation');
  const [successNotice, setSuccessNotice] = useState(null);
  const [formData, setFormData] = useState({
    fromStation: 'Miyapur',
    toStation: 'Ameerpet',
    journeyDate: getTodayForInput(),
    upiId: user?.defaultUpiId || ''
  });

  const paidTickets = tickets.filter((ticket) => ticket.status === 'PAID');
  const pendingTickets = tickets.filter((ticket) => ticket.status === 'PENDING');
  const primaryTicket = selectedTicket || pendingTickets[0] || paidTickets[0] || null;

  const stationOptions = stations.map((station) => station.name);
  const lineStationMap = {
    red: ['Miyapur', 'JNTU College', 'KPHB Colony', 'Kukatpally', 'Balanagar', 'Moosapet', 'Bharat Nagar', 'Erragadda', 'ESI Hospital', 'Ameerpet'],
    blue: ['Raidurg', 'Hitec City', 'Madhapur', 'Peddamma Gudi', 'Jubilee Hills Check Post', 'Madhura Nagar', 'Ameerpet', 'Begumpet', 'Paradise', 'Secunderabad East', 'Panjagutta', 'Khairatabad', 'Lakdikapul', 'Assembly', 'Nampally', 'Gandhi Bhavan', 'Osmania Medical College', 'MGBS'],
    green: ['MGBS', 'Malakpet', 'Dilsukhnagar', 'L B Nagar']
  };

  const filteredStationOptions = activeLine === 'all'
    ? stationOptions
    : stationOptions.filter((station) => lineStationMap[activeLine]?.includes(station));

  const renderedStationOptions = filteredStationOptions.length > 0 ? filteredStationOptions : stationOptions;
  const activeLineLabel = activeLine === 'all' ? 'All Corridors' : `${activeLine.charAt(0).toUpperCase()}${activeLine.slice(1)} Line`;
  const activeLineChipClass = activeLine === 'all' ? 'all-chip' : `${activeLine}-chip`;
  const mapSections = [
    {
      key: 'red',
      title: 'Red Line',
      subtitle: 'Miyapur to Ameerpet',
      accentClass: 'red-network',
      stations: lineStationMap.red,
      highlights: ['Miyapur', 'Kukatpally', 'Ameerpet']
    },
    {
      key: 'blue',
      title: 'Blue Line',
      subtitle: 'Raidurg to MGBS branch',
      accentClass: 'blue-network',
      stations: lineStationMap.blue,
      highlights: ['Raidurg', 'Ameerpet', 'MGBS']
    },
    {
      key: 'green',
      title: 'Green Line',
      subtitle: 'MGBS to L B Nagar',
      accentClass: 'green-network',
      stations: lineStationMap.green,
      highlights: ['MGBS', 'Dilsukhnagar', 'L B Nagar']
    }
  ];
  const carouselSlides = [
    {
      title: 'Fast Track Metro Booking',
      subtitle: 'Reserve in seconds, skip station queues, and ride on time.',
      chip: 'Real-Time Smart Booking'
    },
    {
      title: 'Interactive Route Intelligence',
      subtitle: 'Pick stations, preview distance, fare, and estimated travel instantly.',
      chip: 'Shortest Route + Fare'
    },
    {
      title: 'UPI + Wallet + QR Gate Pass',
      subtitle: 'Pay securely and get an animated QR ticket for station scanning.',
      chip: 'Secure Digital Ticket'
    }
  ];

  useEffect(() => {
    if (!successNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessNotice(null);
    }, 4800);

    return () => window.clearTimeout(timeoutId);
  }, [successNotice]);

  useEffect(() => {
    const loadMetroData = async () => {
      try {
        setLoading(true);
        setPageError('');

        const [stationsData, ticketsData] = await Promise.all([
          getStations(),
          getMyTickets()
        ]);

        setStations(stationsData.stations || []);
        setTickets(ticketsData.tickets || []);
      } catch (error) {
        setPageError(error.message || 'Unable to load metro dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadMetroData();
  }, []);

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      upiId: user?.defaultUpiId || current.upiId
    }));
  }, [user]);

  useEffect(() => {
    if (renderedStationOptions.length === 0) {
      return;
    }

    setFormData((current) => {
      const fromStation = renderedStationOptions.includes(current.fromStation)
        ? current.fromStation
        : renderedStationOptions[0];
      const fallbackTo = renderedStationOptions.find((station) => station !== fromStation) || fromStation;
      const toStation = renderedStationOptions.includes(current.toStation)
        ? current.toStation
        : fallbackTo;

      if (fromStation === current.fromStation && toStation === current.toStation) {
        return current;
      }

      return {
        ...current,
        fromStation,
        toStation
      };
    });
  }, [activeLine, renderedStationOptions]);

  useEffect(() => {
    if (!formData.fromStation || !formData.toStation || formData.fromStation === formData.toStation) {
      setFareInfo(null);
      return;
    }

    const getFarePreview = async () => {
      try {
        setCalculatingFare(true);
        const response = await getFare({
          fromStation: formData.fromStation,
          toStation: formData.toStation
        });
        setFareInfo(response);
      } catch (error) {
        setFareInfo(null);
        setPageError(error.message || 'Unable to calculate fare');
      } finally {
        setCalculatingFare(false);
      }
    };

    getFarePreview();
  }, [formData.fromStation, formData.toStation]);

  useEffect(() => {
    if (!selectedQrTicket?.qrPayload) {
      setQrImage('');
      return;
    }

    QRCode.toDataURL(selectedQrTicket.qrPayload, {
      width: 260,
      margin: 1,
      color: {
        dark: '#05253a',
        light: '#f7f4ea'
      }
    })
      .then(setQrImage)
      .catch(() => setQrImage(''));
  }, [selectedQrTicket]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPageError('');
    setFlashMessage('');
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleMapStationSelect = (stationName) => {
    setPageError('');
    setFlashMessage('');
    setFormData((current) => ({
      ...current,
      [stationPickerTarget]: stationName
    }));
    setStationPickerTarget((current) => (current === 'fromStation' ? 'toStation' : 'fromStation'));
  };

  const handleSuccessNoticeAction = () => {
    if (successNotice?.type === 'payment' && selectedQrTicket) {
      setSuccessNotice(null);
      setSelectedQrTicket(selectedQrTicket);
      return;
    }

    const ticketDesk = document.querySelector('.live-ticket-panel');
    ticketDesk?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setSuccessNotice(null);
  };

  const refreshTickets = async () => {
    const response = await getMyTickets();
    setTickets(response.tickets || []);
    return response.tickets || [];
  };

  const handleBookTicket = async (event) => {
    event.preventDefault();

    if (!formData.fromStation || !formData.toStation || !formData.journeyDate) {
      setPageError('Please select from station, to station, and journey date.');
      return;
    }

    if (formData.fromStation === formData.toStation) {
      setPageError('From and To stations must be different.');
      return;
    }

    try {
      setBooking(true);
      setPageError('');
      const response = await bookTicket({
        fromStation: formData.fromStation,
        toStation: formData.toStation,
        journeyDate: formData.journeyDate
      });

      const updatedTickets = await refreshTickets();
      const createdTicket = response.ticket || updatedTickets[0];
      setSelectedTicket(createdTicket);
      setFlashMessage('Ticket reserved. Complete payment to activate the QR gate pass.');
      setSuccessNotice({
        type: 'booking',
        title: 'Metro ticket reserved successfully',
        description: 'Best wishes for your Hyderabad Metro journey. Your booking is saved in the ticket desk and ready for payment.',
        actionLabel: 'View Booking'
      });
    } catch (error) {
      setPageError(error.message || 'Unable to reserve ticket');
    } finally {
      setBooking(false);
    }
  };

  const handlePayTicket = async (ticket) => {
    try {
      setPayingTicketId(ticket._id);
      setPageError('');
      setFlashMessage('');

      const response = await payTicket({
        ticketId: ticket._id,
        upiId: formData.upiId || user?.defaultUpiId || `${user?.fullName?.split(' ')[0]?.toLowerCase() || 'metro'}@upi`
      });

      updateUser(response.user);
      const updatedTickets = await refreshTickets();
      const paidTicket = updatedTickets.find((item) => item._id === ticket._id) || response.ticket;
      setSelectedTicket(paidTicket);
      setSelectedQrTicket(paidTicket);
      setFlashMessage('Payment complete. Your QR ticket is ready for station scanning.');
      setSuccessNotice({
        type: 'payment',
        title: 'Payment completed successfully',
        description: 'Best wishes. Your Hyderabad Metro QR pass is active now and ready for gate scanning.',
        actionLabel: 'Open QR Ticket'
      });
    } catch (error) {
      setPageError(error.message || 'Unable to process payment');
    } finally {
      setPayingTicketId('');
    }
  };

  const openTicket = (ticket) => {
    setSelectedTicket(ticket);
    if (ticket.status === 'PAID') {
      setSelectedQrTicket(ticket);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  if (loading) {
    return (
      <div className="metro-dashboard loading-screen">
        <div className="loading-card">
          <div className="pulse-rail" />
          <div className="spinner-border text-primary mb-3" role="status" aria-label="Loading metro dashboard" />
          <h2>Loading Hyderabad Metro Control Room</h2>
          <p>Preparing fares, lines, and live ticket desk.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="metro-dashboard">
      <div className="metro-grid" />

      {successNotice && (
        <div className="success-toast" role="status" aria-live="polite">
          <div className="success-toast-icon">
            <FiCheckCircle />
          </div>
          <div className="success-toast-copy">
            <p className="success-toast-label">Journey Update</p>
            <h3>{successNotice.title}</h3>
            <p>{successNotice.description}</p>
          </div>
          <div className="success-toast-actions">
            <button type="button" className="success-toast-btn" onClick={handleSuccessNoticeAction}>
              {successNotice.actionLabel}
            </button>
            <button type="button" className="success-toast-close" onClick={() => setSuccessNotice(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <header className="metro-topbar">
        <div>
          <p className="eyebrow">Hyderabad Metro Smart Ticketing</p>
          <h1>Book. Pay. Scan. Ride.</h1>
          <p className="topbar-copy">
            Choose your stations, confirm the route, and activate a QR ticket from your metro wallet in seconds.
          </p>
        </div>

        <div className="topbar-actions">
          <div className="date-pill">
            <FiCalendar />
            <span>{todayFormatted}</span>
          </div>
          <button className="logout-btn btn metro-btn-logout" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <section className="metro-carousel-wrap mb-4">
        <div id="metroHeroCarousel" className="carousel slide carousel-fade metro-carousel" data-bs-ride="carousel" data-bs-interval="3300">
          <div className="carousel-indicators">
            {carouselSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                data-bs-target="#metroHeroCarousel"
                data-bs-slide-to={index}
                className={index === 0 ? 'active' : ''}
                aria-current={index === 0 ? 'true' : 'false'}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="carousel-inner rounded-4 overflow-hidden">
            {carouselSlides.map((slide, index) => (
              <div key={slide.title} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                <div className="metro-slide-content">
                  <span className="metro-slide-chip">{slide.chip}</span>
                  <h2>{slide.title}</h2>
                  <p>{slide.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="carousel-control-prev" type="button" data-bs-target="#metroHeroCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#metroHeroCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </section>

      <section className="metro-logo-ribbon mb-4">
        <div className="metro-logo-card">
          <div className="metro-logo-badge">
            <FaTrainSubway />
            <span>HMRL</span>
          </div>
          <div>
            <h4>Hyderabad Metro Rail</h4>
            <p>City Mobility • Smart Ticketing • Contactless Entry</p>
          </div>
        </div>
        <div className="metro-arrival-scene" aria-hidden="true">
          <div className="metro-platform-sign">
            <span>Next Arrival</span>
            <strong>Hyderabad Metro</strong>
          </div>

          <div className="metro-train-track">
            <div className="metro-platform-columns">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="metro-track-rail rail-top" />
            <div className="metro-track-rail rail-bottom" />
            <div className="metro-platform-shadow" />

            <div className="metro-arrival-train train-arrival-one">
              <img src={metroTrainArrival} alt="Hyderabad Metro train arrival" className="metro-arrival-train-image" />
            </div>
          </div>
        </div>
      </section>

      <section className="metro-logo-flex-wrap glass-card">
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">Metro Identity</p>
            <h3>Official Corridor Logos</h3>
          </div>
        </div>

        <div className="metro-logo-flex-grid">
          <article className="metro-logo-flex-card hmrl-card">
            <img src={hmrlLogo} alt="Hyderabad Metro Rail official identity" />
            <h4>Hyderabad Metro Rail</h4>
            <p>Unified smart mobility branding for ticketing and access.</p>
          </article>

          <article className="metro-logo-flex-card red-card">
            <img src={redLineLogo} alt="Red line corridor logo" />
            <h4>Red Line</h4>
            <p>Miyapur to LB Nagar corridor connectivity.</p>
          </article>

          <article className="metro-logo-flex-card blue-card">
            <img src={blueLineLogo} alt="Blue line corridor logo" />
            <h4>Blue Line</h4>
            <p>Raidurg to Nagole technology and city corridor.</p>
          </article>

          <article className="metro-logo-flex-card green-card">
            <img src={greenLineLogo} alt="Green line corridor logo" />
            <h4>Green Line</h4>
            <p>JBS to MGBS compact central interchange corridor.</p>
          </article>
        </div>
      </section>

      <section className="metro-map-panel glass-card">
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">Color Guide</p>
            <h3>Red • Blue • Green Metro Map</h3>
          </div>
        </div>

        <div className="line-filter-group" role="group" aria-label="Filter stations by metro line">
          <button
            type="button"
            className={`line-filter-btn all-filter ${activeLine === 'all' ? 'active' : ''}`}
            onClick={() => setActiveLine('all')}
          >
            All Lines
          </button>
          <button
            type="button"
            className={`line-filter-btn red-filter ${activeLine === 'red' ? 'active' : ''}`}
            onClick={() => setActiveLine('red')}
          >
            Red Line
          </button>
          <button
            type="button"
            className={`line-filter-btn blue-filter ${activeLine === 'blue' ? 'active' : ''}`}
            onClick={() => setActiveLine('blue')}
          >
            Blue Line
          </button>
          <button
            type="button"
            className={`line-filter-btn green-filter ${activeLine === 'green' ? 'active' : ''}`}
            onClick={() => setActiveLine('green')}
          >
            Green Line
          </button>
        </div>

        <div className="metro-map-legend">
          <div className="legend-pill red-line-pill">Red Line: Miyapur to Ameerpet</div>
          <div className="legend-pill blue-line-pill">Blue Line: Raidurg, Secunderabad and MGBS branches</div>
          <div className="legend-pill green-line-pill">Green Line: MGBS to L B Nagar</div>
        </div>

        <div className="map-picker-panel">
          <div className="map-picker-header">
            <div>
              <p className="eyebrow">Interactive Network Guide</p>
              <h4>Click any station on the schematic metro map to fill your trip form</h4>
            </div>
            <div className="station-target-toggle" role="group" aria-label="Choose whether the next station selection updates from or to station">
              <button
                type="button"
                className={`target-toggle-btn ${stationPickerTarget === 'fromStation' ? 'active' : ''}`}
                onClick={() => setStationPickerTarget('fromStation')}
              >
                Set From
              </button>
              <button
                type="button"
                className={`target-toggle-btn ${stationPickerTarget === 'toStation' ? 'active' : ''}`}
                onClick={() => setStationPickerTarget('toStation')}
              >
                Set To
              </button>
            </div>
          </div>

          <div className="map-selection-status">
            <span className="map-selection-pill">Next click updates: {stationPickerTarget === 'fromStation' ? 'From Station' : 'To Station'}</span>
            <span className="map-selection-pill">Selected trip: {formData.fromStation} to {formData.toStation}</span>
          </div>

          <div className="metro-visual-map">
            {mapSections.map((section) => (
              <button
                key={section.key}
                type="button"
                className={`map-overview-card ${section.accentClass} ${activeLine === section.key ? 'active' : ''} ${activeLine !== 'all' && activeLine !== section.key ? 'line-dimmed' : ''}`}
                onClick={() => setActiveLine(section.key)}
              >
                <div className="map-overview-head">
                  <div>
                    <h4>{section.title}</h4>
                    <p>{section.subtitle}</p>
                  </div>
                  <span className="network-line-count">{section.stations.length} stations</span>
                </div>

                <div className="map-overview-track" aria-hidden="true">
                  <div className={`simple-line-bar ${section.key}-bar`} />
                  <div className="map-overview-stops">
                    {section.highlights.map((stationName) => (
                      <span key={`${section.key}-${stationName}`}>{stationName}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="interactive-network-guide">
            {mapSections.map((section) => (
              <article
                key={`${section.key}-guide`}
                className={`network-line-card ${section.accentClass} ${activeLine !== 'all' && activeLine !== section.key ? 'line-dimmed' : ''}`}
              >
                <div className="network-line-head">
                  <div>
                    <h4>{section.title}</h4>
                    <p>{section.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    className={`guide-focus-btn ${activeLine === section.key ? 'active' : ''}`}
                    onClick={() => setActiveLine(activeLine === section.key ? 'all' : section.key)}
                  >
                    {activeLine === section.key ? 'Show All Lines' : `Focus ${section.title}`}
                  </button>
                </div>

                <div className="network-station-grid">
                  {section.stations.map((stationName) => {
                    const isSelected = formData.fromStation === stationName || formData.toStation === stationName;
                    const isInterchange = INTERCHANGE_STATIONS.includes(stationName);

                    return (
                      <button
                        key={`${section.key}-${stationName}`}
                        type="button"
                        className={`network-station-chip ${isSelected ? 'selected' : ''} ${isInterchange ? 'interchange' : ''}`}
                        onClick={() => handleMapStationSelect(stationName)}
                      >
                        <span>{stationName}</span>
                        <small>{isInterchange ? 'Interchange station' : `Tap to set ${stationPickerTarget === 'fromStation' ? 'From' : 'To'}`}</small>
                      </button>
                    );
                  })}
                </div>
              </article>
            ))}

            <div className="schematic-map-notes">
              <span className="map-selection-pill">Interchanges: Ameerpet, MGBS</span>
              <span className="map-selection-pill">Use the map overview above and station guide below together</span>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-panel">
        <div className="hero-copy">
          <div className="line-chip-group">
            <span className="line-chip red-line">Red Line</span>
            <span className="line-chip blue-line">Blue Line</span>
            <span className="line-chip green-line">Green Line</span>
          </div>

          <h2>{user?.fullName}, your metro account is live.</h2>
          <p>
            Wallet-backed UPI checkout, route-aware fares, and instant QR gates for Hyderabad Metro corridors.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <FiCreditCard />
              <div>
                <strong>Rs. {Number(user?.walletBalance || 0).toFixed(2)}</strong>
                <span>Metro wallet</span>
              </div>
            </div>
            <div className="hero-stat">
              <FiShield />
              <div>
                <strong>{user?.metroCardNumber}</strong>
                <span>Smart commuter ID</span>
              </div>
            </div>
            <div className="hero-stat">
              <FiZap />
              <div>
                <strong>{paidTickets.length}</strong>
                <span>Activated tickets</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-train-card">
          <div className="train-window-band">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="train-body">
            <div>
              <p className="eyebrow">Live Route Preview</p>
              <h3>
                {fareInfo ? `${fareInfo.fromStation} to ${fareInfo.toStation}` : 'Select your trip'}
              </h3>
              <p>
                {fareInfo
                  ? `${fareInfo.distanceKm} km journey across ${fareInfo.routeStations.length} stations.`
                  : 'A smart fare summary appears here the moment you choose two stations.'}
              </p>
            </div>
            <div className="train-metrics">
              <div>
                <span>Fare</span>
                <strong>{fareInfo ? `Rs. ${fareInfo.fare}` : '--'}</strong>
              </div>
              <div>
                <span>ETA</span>
                <strong>{fareInfo ? `${fareInfo.durationMinutes} min` : '--'}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(pageError || flashMessage) && (
        <div className={`status-banner ${pageError ? 'error' : 'success'}`}>
          <span>{pageError || flashMessage}</span>
        </div>
      )}

      <main className="dashboard-shell">
        <section className="booking-panel glass-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Journey Planner</p>
              <h3>Reserve your Hyderabad Metro ticket</h3>
            </div>
            <button
              type="button"
              className="ghost-btn btn metro-btn-refresh"
              onClick={async () => {
                setPageError('');
                setFlashMessage('');
                try {
                  await refreshTickets();
                  setFlashMessage('Latest tickets refreshed from the server.');
                } catch (error) {
                  setPageError(error.message || 'Unable to refresh tickets');
                }
              }}
            >
              <FiRefreshCw />
              <span>Refresh</span>
            </button>
          </div>

          <form className="booking-form" onSubmit={handleBookTicket}>
            <label>
              <span>From Station</span>
              <div className="input-shell">
                <FiMapPin />
                <select name="fromStation" value={formData.fromStation} onChange={handleInputChange}>
                  {renderedStationOptions.map((stationName) => (
                    <option key={stationName} value={stationName}>
                      {stationName}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label>
              <span>To Station</span>
              <div className="input-shell">
                <FiNavigation />
                <select name="toStation" value={formData.toStation} onChange={handleInputChange}>
                  {renderedStationOptions.map((stationName) => (
                    <option key={stationName} value={stationName}>
                      {stationName}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <div className="line-selection-hint" aria-live="polite">
              <span className={`line-hint-chip ${activeLineChipClass}`}>{activeLineLabel}</span>
              <span className="line-hint-chip count-chip">{renderedStationOptions.length} stations visible</span>
              {activeLine !== 'all' && <span className="line-hint-chip interchange-chip">Interchange: Ameerpet</span>}
            </div>

            <label>
              <span>Journey Date</span>
              <div className="input-shell">
                <FiCalendar />
                <input
                  type="date"
                  name="journeyDate"
                  value={formData.journeyDate}
                  min={getTodayForInput()}
                  onChange={handleInputChange}
                />
              </div>
            </label>

            <label>
              <span>UPI ID</span>
              <div className="input-shell">
                <FiCreditCard />
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  placeholder="name@upi"
                  onChange={handleInputChange}
                />
              </div>
            </label>

            <div className="fare-preview">
              <div className="fare-heading">
                <h4>Route Summary</h4>
                {calculatingFare && <span>Calculating...</span>}
              </div>

              {fareInfo ? (
                <>
                  <div className="fare-grid">
                    <div>
                      <span>Distance</span>
                      <strong>{fareInfo.distanceKm} km</strong>
                    </div>
                    <div>
                      <span>Fare</span>
                      <strong>Rs. {fareInfo.fare}</strong>
                    </div>
                    <div>
                      <span>Travel Time</span>
                      <strong>{fareInfo.durationMinutes} min</strong>
                    </div>
                  </div>

                  <div className="route-strip">
                    {fareInfo.routeStations.map((station, index) => (
                      <React.Fragment key={station}>
                        <span className="route-stop">{station}</span>
                        {index < fareInfo.routeStations.length - 1 && <FiArrowRight className="route-arrow" />}
                      </React.Fragment>
                    ))}
                  </div>
                </>
              ) : (
                <p className="empty-text">Choose different stations to see the route, fare, and trip duration.</p>
              )}
            </div>

            <button
              type="submit"
              className="primary-btn metro-btn-book"
              disabled={
                booking
                || !formData.fromStation
                || !formData.toStation
                || !formData.journeyDate
              }
            >
              {booking ? 'Reserving your ticket...' : 'Reserve Metro Ticket'}
            </button>
          </form>
        </section>

        <aside className="side-column">
          <section className="glass-card account-panel">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Metro Wallet</p>
                <h3>Passenger profile</h3>
              </div>
            </div>

            <div className="account-card">
              <div className="account-avatar">
                <FiUser />
              </div>
              <div>
                <h4>{user?.fullName}</h4>
                <p>{user?.email}</p>
                <p className="metro-location-tag"><FaMapLocationDot /> Hyderabad Urban Region</p>
              </div>
            </div>

            <div className="wallet-stat-list">
              <div>
                <span>Available balance</span>
                <strong>Rs. {Number(user?.walletBalance || 0).toFixed(2)}</strong>
              </div>
              <div>
                <span>Preferred UPI</span>
                <strong>{user?.defaultUpiId || 'Set during payment'}</strong>
              </div>
              <div>
                <span>Commuter since</span>
                <strong>{new Date(user?.createdAt).toLocaleDateString('en-IN')}</strong>
              </div>
            </div>
          </section>

          <section className="glass-card live-ticket-panel">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Ticket Desk</p>
                <h3>Pending and active rides</h3>
              </div>
            </div>

            {tickets.length === 0 ? (
              <p className="empty-text">No bookings yet. Reserve your first metro ride from the planner.</p>
            ) : (
              <div className="ticket-list">
                {pendingTickets.length > 0 && (
                  <div className="ticket-group">
                    <h4 className="ticket-group-title">Pending Booking Tickets ({pendingTickets.length})</h4>
                    {pendingTickets.map((ticket) => (
                      <article
                        key={ticket._id}
                        className={`ticket-card ${primaryTicket?._id === ticket._id ? 'active' : ''}`}
                        onClick={() => openTicket(ticket)}
                      >
                        <div className="ticket-card-top">
                          <div>
                            <p>{ticket.ticketNumber}</p>
                            <h4>{ticket.fromStation} to {ticket.toStation}</h4>
                          </div>
                          <span className={`ticket-status ${ticket.status.toLowerCase()}`}>{ticket.status}</span>
                        </div>

                        <div className="ticket-meta">
                          <span><FiClock /> {ticket.durationMinutes} min</span>
                          <span><FiCreditCard /> Rs. {ticket.fare}</span>
                        </div>

                        <button
                          type="button"
                          className="secondary-btn btn metro-btn-pay"
                          onClick={(event) => {
                            event.stopPropagation();
                            handlePayTicket(ticket);
                          }}
                          disabled={payingTicketId === ticket._id}
                        >
                          {payingTicketId === ticket._id ? 'Processing payment...' : 'Pay with Metro Wallet'}
                        </button>
                      </article>
                    ))}
                  </div>
                )}

                {paidTickets.length > 0 && (
                  <div className="ticket-group">
                    <h4 className="ticket-group-title">Paid Booking Tickets ({paidTickets.length})</h4>
                    {paidTickets.map((ticket) => (
                      <article
                        key={ticket._id}
                        className={`ticket-card ${primaryTicket?._id === ticket._id ? 'active' : ''}`}
                        onClick={() => openTicket(ticket)}
                      >
                        <div className="ticket-card-top">
                          <div>
                            <p>{ticket.ticketNumber}</p>
                            <h4>{ticket.fromStation} to {ticket.toStation}</h4>
                          </div>
                          <span className={`ticket-status ${ticket.status.toLowerCase()}`}>{ticket.status}</span>
                        </div>

                        <div className="ticket-meta">
                          <span><FiClock /> {ticket.durationMinutes} min</span>
                          <span><FiCreditCard /> Rs. {ticket.fare}</span>
                        </div>

                        <button
                          type="button"
                          className="secondary-btn btn metro-btn-view"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedQrTicket(ticket);
                          }}
                        >
                          View QR Ticket
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </aside>
      </main>

      <section className="glass-card showcase-panel">
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">Trip Intelligence</p>
            <h3>What this ticket gives you</h3>
          </div>
        </div>

        <div className="showcase-grid">
          <article>
            <FiNavigation />
            <h4>Route-aware pricing</h4>
            <p>Shortest path calculation across interchange stations gives you distance-based fare instantly.</p>
          </article>
          <article>
            <FiCreditCard />
            <h4>Wallet + UPI payment</h4>
            <p>Each successful payment updates your metro wallet balance and remembers the last UPI handle.</p>
          </article>
          <article>
            <FiShield />
            <h4>QR gate pass</h4>
            <p>Paid tickets become scannable QR passes with journey, payment, and route data encoded.</p>
          </article>
        </div>
      </section>

      {selectedQrTicket && (
        <div className="ticket-modal" onClick={() => setSelectedQrTicket(null)}>
          <div className="ticket-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Active QR Ticket</p>
                <h3>{selectedQrTicket.ticketNumber}</h3>
              </div>
              <button type="button" className="ghost-btn metro-btn-close" onClick={() => setSelectedQrTicket(null)}>
                Close
              </button>
            </div>

            <div className="qr-layout">
              <div className="qr-box">
                {qrImage ? <img src={qrImage} alt="Metro QR Ticket" /> : <div className="qr-placeholder" />}
              </div>

              <div className="qr-details">
                <h4>{selectedQrTicket.fromStation} to {selectedQrTicket.toStation}</h4>
                <p>Journey date: {new Date(selectedQrTicket.journeyDate).toLocaleString('en-IN')}</p>
                <p>Fare paid: Rs. {selectedQrTicket.fare}</p>
                <p>Travel time: {selectedQrTicket.durationMinutes} min</p>
                <p>Payment ref: {selectedQrTicket.paymentRef}</p>
                <p>Valid until: {selectedQrTicket.validUntil ? new Date(selectedQrTicket.validUntil).toLocaleString('en-IN') : '2 hours from activation'}</p>

                <div className="route-strip modal-route">
                  {(selectedQrTicket.routeStations || []).map((station, index, routeStations) => (
                    <React.Fragment key={`${selectedQrTicket._id}-${station}`}>
                      <span className="route-stop">{station}</span>
                      {index < routeStations.length - 1 && <FiArrowRight className="route-arrow" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
