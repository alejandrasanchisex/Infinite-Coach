import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    let tid = searchParams.get('t') || 'default';
    
    // Normalize trainer ID
    let lower = tid.toLowerCase().trim();
    if (lower === 'asteam' || lower === 'alejandra') {
        tid = 't-w0iybl7qb';
    } else if (lower === 'toledo' || lower === 'vtoledo') {
        tid = 't-8umeizyns';
    }
    
    let brandName = 'Infinite Coach';
    let logoToUse = 'https://www.infinitecoach.es/img/logo-infinite-coach.png';
    let primaryColor = '#00D9FF';
    let secondaryColor = '#0F0F1E';
    
    // Hardcoded ASTeam override in case database is slow/empty
    if (tid === 't-w0iybl7qb' || tid === 't-zum04ds2n') {
        brandName = 'ASTeam';
        logoToUse = 'https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1779724548154_Gemini_Generated_Image_vse84nvse84nvse8.png';
        primaryColor = '#fdbfec';
        secondaryColor = '#1a1a2e';
    } else if (tid === 't-8umeizyns') {
        brandName = 'Toledo The Bull';
        logoToUse = 'https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1781711106755_toledo_the_bull.png';
        primaryColor = '#E60026';
        secondaryColor = '#0A0A0E';
    } else if (tid !== 'default') {
        try {
            const { data, error } = await supabase
                .from('trainer_profiles')
                .select('full_data')
                .eq('trainer_id', tid)
                .single();
                
            if (!error && data && data.full_data && data.full_data.brand) {
                const brand = data.full_data.brand;
                if (brand.name) brandName = brand.name;
                if (brand.logo) logoToUse = brand.logo;
                if (brand.colors) {
                    if (brand.colors.primary) primaryColor = brand.colors.primary;
                    if (brand.colors.secondary) secondaryColor = brand.colors.secondary;
                }
            }
        } catch(e) {
            console.warn("Dynamic manifest Supabase fetch error:", e);
        }
    }
    
    const manifest = {
        name: brandName,
        short_name: brandName,
        start_url: `/client-login.html?t=${tid}`,
        display: "standalone",
        background_color: secondaryColor,
        theme_color: primaryColor,
        orientation: "portrait",
        icons: [
            {
                src: logoToUse,
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: logoToUse,
                sizes: "512x512",
                type: "image/png"
            }
        ]
    };
    
    return new NextResponse(JSON.stringify(manifest), {
        headers: {
            'Content-Type': 'application/manifest+json; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, must-revalidate'
        }
    });
}
