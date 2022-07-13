from multiprocessing import cpu_count

bind = '0.0.0.0:8000'
daemon = False
workers = cpu_count()
