import { NextResponse } from 'next/server'

export function GET() {
    return NextResponse.json(
        { success: false, message: 'API route not found' },
        { status: 404 }
    )
}

export function POST() {
    return NextResponse.json(
        { success: false, message: 'API route not found' },
        { status: 404 }
    )
}

export function PUT() {
    return NextResponse.json(
        { success: false, message: 'API route not found' },
        { status: 404 }
    )
}

export function DELETE() {
    return NextResponse.json(
        { success: false, message: 'API route not found' },
        { status: 404 }
    )
}
