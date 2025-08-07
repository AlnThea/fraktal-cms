import React from 'react';
import Welcome from '@/Components/Welcome';
import AppLayout from '@/Layouts/AppLayout';

export default function Dashboard() {
    return (
        <AppLayout
            title="Dashboard"
            breadcrumb={() => (
                <div className={'flex items-center'}>
                    <span className="mx-3 text-gray-300 dark:text-gray-300"> / </span>
                </div>
            )}
            renderHeader={() => (
                <span className="">Dashboard</span>
            )}

        >
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className=" dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                        <Welcome/>

                        <div className={'p-5 bg-green-600 text-white'}> YAHOO</div>
                    </div>
                </div>
            </div>

        </AppLayout>
    );
}
