# Walkthrough: Cash Register (Corte de Caja) Module

This document outlines the implementation of the Cash Register module.

## 1. Database Changes

Run `caja_migration.sql` in Supabase.

## 2. Features

- **Open Box**: Start a session with initial cash.
- **Register Movement**: Add/remove cash manually.
- **Close Box**: Reconcile system totals vs physical count.
- **History**: View past sessions.
