export const VEHICLE_DATA: Record<string, any> = {
    // SEDANS
    'swift-dzire': {
        name: 'Swift Dzire',
        category: 'sedans',
        type: 'Sedan',
        tagline: 'The Ultimate Choice for Comfort & Style.',
        description: 'Experience the perfect blend of style, comfort, and efficiency with the Maruti Suzuki Swift Dzire.',
        images: [
            '/swift_dzire_commercial_1775902836907.png',
            '/swift_dzire_interior_1775903420272.png',
            '/swift_dzire_rear_1775903446751.png'
        ],
        features: ['Premium Interiors', 'Auto Climate Control', 'Rear AC Vents'],
        price: 'Start from ₹12/km'
    },
    'hyundai-aura': {
        name: 'Hyundai Aura',
        category: 'sedans',
        type: 'Sedan',
        tagline: 'Sophistication meets Performance.',
        description: 'Modern design and premium features. Smooth, quiet ride with advanced safety.',
        images: [
            '/hyundai_aura_professional_1775904422519.png',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Smart Infotainment', 'Cruise Control', 'Wireless Charging'],
        price: 'Start from ₹13/km'
    },
    'honda-amaze': {
        name: 'Honda Amaze',
        category: 'sedans',
        type: 'Sedan',
        tagline: 'Spacious & Smart Choice.',
        description: 'Perfect balance of performance and space. Ideal for city driving.',
        images: [
            '/honda_amaze_professional_1775904463253.png',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Best-in-class Boot', 'Paddle Shifters', 'Push Button Start'],
        price: 'Start from ₹13/km'
    },
    'honda-city': {
        name: 'Honda City',
        category: 'sedans',
        type: 'Premium Sedan',
        tagline: 'The Legend of Luxury.',
        description: 'The gold standard for premium sedans. Refined engine and plush leather interiors.',
        images: [
            'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Sunroof', 'Leather Upholstery', '6 Airbags'],
        price: 'Start from ₹15/km'
    },
    'maruti-suzuki-ciaz': {
        name: 'Ciaz',
        category: 'sedans',
        type: 'Executive Sedan',
        tagline: 'Experience Granduer & Efficiency.',
        description: 'Massive rear-seat legroom and an executive look.',
        images: [
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Massive Rear Legroom', 'Smart Hybrid', 'Rear AC Vents'],
        price: 'Start from ₹14/km'
    },

    // SUV/MUVS
    'ertiga': {
        name: 'Ertiga',
        category: 'suv-muvs',
        type: 'MUV',
        tagline: 'Perfect for Family Journeys.',
        description: 'India most loved family MUV. Flexible 7-seater.',
        images: [
            '/maruti_ertiga_professional_1775904506507.png',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['7-Seater', 'Flexible Seating', 'Dual Airbags'],
        price: 'Start from ₹16/km'
    },
    'fortuner': {
        name: 'Fortuner',
        category: 'suv-muvs',
        type: 'Premium SUV',
        tagline: 'Dominate Every Terrain.',
        description: 'Epitome of power and presence. Unmatched off-road capability.',
        images: [
            '/toyota_fortuner_commercial_1775902864944.png',
            '/fortuner_interior_1775903465968.png',
            '/fortuner_action_1775903496499.png'
        ],
        features: ['Power Engine', '4WD Capabilities', 'Premium Audio'],
        price: 'Start from ₹35/km'
    },
    'innova-crysta': {
        name: 'Innova Crysta',
        category: 'suv-muvs',
        type: 'Premium MUV',
        tagline: 'Unmatched Comfort.',
        description: 'Redefined luxury and comfort in the MUV segment.',
        images: [
            '/innova_crysta_professional_1775903517708.png',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Captain Seats', '7 Airbags', 'Premium Interiors'],
        price: 'Start from ₹22/km'
    },
    'innova-hycross': {
        name: 'Innova Hycross',
        category: 'suv-muvs',
        type: 'Hybrid Premium MUV',
        tagline: 'The Future of Group Travel.',
        description: 'Advanced hybrid technology meets legendary reliability.',
        images: [
            '/innova_hycross_professional_1775904536982.png',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Hybrid Tech', 'Ottoman Seats', 'ADAS Safety'],
        price: 'Start from ₹25/km'
    },
    'rumion': {
        name: 'Rumion',
        category: 'suv-muvs',
        type: 'MUV',
        tagline: 'Spacious & Reliable.',
        description: 'Toyota reliability in a compact, fuel-efficient MUV.',
        images: [
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['7-Seater', 'Fuel Efficient', 'Spacious Cabin'],
        price: 'Start from ₹16/km'
    },
    'invicto': {
        name: 'Invicto',
        category: 'suv-muvs',
        type: 'Premium Hybrid MUV',
        tagline: 'Opulence Reimagined.',
        description: 'The most premium hybrid MUV offering luxury at its best.',
        images: [
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Hybrid Tech', 'Ventilated Seats', 'Sunroof'],
        price: 'Start from ₹24/km'
    },
    'carnival': {
        name: 'Carnival',
        category: 'suv-muvs',
        type: 'Luxury Limousine MUV',
        tagline: 'Travel Like a VIP.',
        description: 'Ultra-luxury limousine feel for the ultimate ground travel.',
        images: [
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Dual Sunroof', 'VIP Seats', 'Limousine Feel'],
        price: 'Start from ₹40/km'
    },
    'carens': {
        name: 'Carens',
        category: 'suv-muvs',
        type: 'Modern MUV',
        tagline: 'Style for Every Journey.',
        description: 'Versatile 6/7 seater combining SUV style with MUV space.',
        images: [
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Bose Sound', 'Air Purifier', '6 Airbags'],
        price: 'Start from ₹16/km'
    },

    // LUXURY CARS
    'camry': {
        name: 'Camry',
        category: 'luxury-cars',
        type: 'Hybrid Luxury Sedan',
        tagline: 'The Self-Charging Hybrid Luxury.',
        description: 'The epitome of elegance and sustainability for high-end travel.',
        images: [
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['JBL Audio', 'Hybrid Efficiency', 'Rear Power Recline'],
        price: 'Start from ₹28/km'
    },
    'e-class': {
        name: 'E-Class',
        category: 'luxury-cars',
        type: 'Luxury Sedan',
        tagline: 'The Masterpiece of Intelligence.',
        description: 'Supreme luxury and advanced tech, the ultimate chauffeur car.',
        images: [
            'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Chauffeur Package', 'Panoramic Sunroof', 'Burmester Sound'],
        price: 'Start from ₹85/km'
    },
    's-class': {
        name: 'Mercedes S-Class',
        category: 'luxury-cars',
        type: 'Flagship Luxury Sedan',
        tagline: 'The Best Car in the World.',
        description: 'Unmatched refinement and prestige. The pinnacle of automotive luxury.',
        images: [
            'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Executive Rear Seats', 'Air Suspension', 'Massage Seats'],
        price: 'Start from ₹150/km'
    },
    'bmw-7': {
        name: 'BMW 7 Series',
        category: 'luxury-cars',
        type: 'Premium Luxury Sedan',
        tagline: 'Driving Luxury Forward.',
        description: 'Combines dynamic performance with exclusive interior luxury.',
        images: [
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Bowers & Wilkins Sound', 'Gesture Control', 'Rear Screen'],
        price: 'Start from ₹140/km'
    },
    'jaguar-xf': {
        name: 'Jaguar XF',
        category: 'luxury-cars',
        type: 'British Luxury Sedan',
        tagline: 'The Art of Performance.',
        description: 'Exquisite design and effortless performance for a unique travel experience.',
        images: [
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Meridian Audio', 'Leather Interiors', 'Sports Mode'],
        price: 'Start from ₹90/km'
    },
    'viano': {
        name: 'Mercedes Viano',
        category: 'luxury-cars',
        type: 'Luxury Van/MPV',
        tagline: 'Space & Prestige.',
        description: 'Ideal for group business travel with Mercedes-Benz luxury standards.',
        images: [
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Face-to-face Seating', 'Electric Doors', 'Privacy Glass'],
        price: 'Start from ₹110/km'
    },
    'defender': {
        name: 'Land Rover Defender',
        category: 'luxury-cars',
        type: 'Luxury Off-Road SUV',
        tagline: 'Capable of Great Things.',
        description: 'The ultimate luxury off-roader for adventurous premium tours.',
        images: [
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['All-Wheel Drive', 'Air Suspension', 'Wading Depth'],
        price: 'Start from ₹180/km'
    },
    'vellfire': {
        name: 'Vellfire',
        category: 'luxury-cars',
        type: 'Luxury MPV',
        tagline: 'Private Jet on Wheels.',
        description: 'Unmatched luxury with ottoman seats for celebrities and high-profile executives.',
        images: [
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Executive Ottoman Seats', 'Dual Sunroof', '16-color Ambient Light'],
        price: 'Start from ₹120/km'
    },

    // VANS
    'tempo-traveller': {
        name: 'Tempo Traveller',
        category: 'van',
        type: '9/12 Seater Luxury Van',
        tagline: 'Perfect for Group Outings.',
        description: 'Customized for maximum comfort on long journeys. Best choice for small groups.',
        images: [
            '/tempo_traveller_luxury_1775904569102.png',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Pushback Seats', 'High Roof Cabin', 'Individual AC Vents'],
        price: 'Start from ₹24/km'
    },
    'tempo-15': {
        name: 'Tempo Traveller 15 Seater',
        category: 'van',
        type: '15 Seater Luxury Van',
        tagline: 'Ideal for Larger Groups.',
        description: 'More seats, same luxury. Perfect for wedding groups and pilgrimages.',
        images: [
            '/tempo_traveller_luxury_1775904569102.png',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['15 Reclining Seats', 'Extra Boot Space', 'LCD Entertainment'],
        price: 'Start from ₹28/km'
    },
    'urbania': {
        name: 'Urbania',
        category: 'van',
        type: 'Premium Cruiser (9/12 Seater)',
        tagline: 'Next-Gen Group Travel.',
        description: 'Indias first world-class premium cruiser with luxury cabin.',
        images: [
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Aerodynamic Styling', 'Soft Touch Interiors', 'Sealing Mounted AC'],
        price: 'Start from ₹32/km'
    },
    'urbania-15': {
        name: 'Urbania 15 Seater',
        category: 'van',
        type: 'Premium Cruiser (15 Seater)',
        tagline: 'Luxurious Group Commute.',
        description: 'Maximum capacity meeting world-class premium standards.',
        images: [
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Semi-Automatic Transmission', 'Soft Touch Interiors', 'Panoramic Windows'],
        price: 'Start from ₹36/km'
    },

    // EV CARS
    'tigor': {
        name: 'Tata Tigor',
        category: 'ev-cars',
        type: 'Electric Sedan',
        tagline: 'Safe & Sustainable.',
        description: 'Clean and silent drive with a high safety rating. Perfect for city commutes.',
        images: [
            'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Zero Emissions', 'Smart Connectivity', 'Spacious Boot'],
        price: 'Start from ₹14/km'
    },
    'nexon': {
        name: 'Tata Nexon',
        category: 'ev-cars',
        type: 'Electric SUV',
        tagline: 'India Most Loved EV.',
        description: 'Electric power with robust design and great range.',
        images: [
            'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Fast Charging', 'Sunroof', 'i-TPMS'],
        price: 'Start from ₹16/km'
    },
    'mg-zs': {
        name: 'MG ZS EV',
        category: 'ev-cars',
        type: 'Electric SUV',
        tagline: 'Change What You Can.',
        description: 'Premium electric SUV combining luxury with eco-friendly performance.',
        images: [
            'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Zero Emissions', 'Panoramic Sky Roof', 'i-SMART Tech'],
        price: 'Start from ₹18/km'
    },
    'ioniq-5': {
        name: 'Ioniq 5',
        category: 'ev-cars',
        type: 'Premium Electric Crossover',
        tagline: 'Power Your World.',
        description: 'Futuristic EV with ultra-fast charging and a lounge-like interior.',
        images: [
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Ultra-fast Charging', 'V2L Technology', 'Sustainable Materials'],
        price: 'Start from ₹30/km'
    },

    // LUXURY BUSES
    'mini-coach': {
        name: 'Mini Bus Coach',
        category: 'luxury-buses',
        type: '17-21 Seater Luxury Mini Bus',
        tagline: 'Luxury for Small Groups.',
        description: 'Premium travel experience for corporate groups and wedding parties.',
        images: [
            '/mini_bus_coach_professional_1775904970701.png',
            'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Pushback Seats', 'Individual Reading Lights', 'LCD Screen'],
        price: 'Start from ₹35/km'
    },
    'luxury-coach': {
        name: 'Luxury Coach',
        category: 'luxury-buses',
        type: '35-45 Seater Premium Coach',
        tagline: 'Ultimate Group Travel.',
        description: 'Large group luxury for long-distance group tours.',
        images: [
            '/luxury_coach_professional_1775905001284.png',
            'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Air Suspension', 'Reclining Seats', 'Entertainment System'],
        price: 'Start from ₹55/km'
    },
    'scania-volvo': {
        name: 'Scania/Volvo Bus',
        category: 'luxury-buses',
        type: 'Multi-Axle Super Luxury Bus',
        tagline: 'World-Class Road Travel.',
        description: 'Pinnacle of road travel safe and unparalleled ride comfort.',
        images: [
            'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2070&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop'
        ],
        features: ['Multi-Axle Stability', 'CCTV Security', 'GPS Tracking'],
        price: 'Start from ₹75/km'
    }
};

/**
 * Dynamic Vehicle Rendering Helper
 * Ensures consistent data and image retrieval across the entire application.
 */
export const getVehicleBySlug = (slug: string) => {
    return VEHICLE_DATA[slug] || null;
};

export const getVehiclesByCategory = (category: string) => {
    return Object.entries(VEHICLE_DATA)
        .filter(([_, data]) => data.category === category)
        .map(([slug, data]) => ({ slug, ...data }));
};

export const getAllVehicles = () => {
    return Object.entries(VEHICLE_DATA).map(([slug, data]) => ({ slug, ...data }));
};
